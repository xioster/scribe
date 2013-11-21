define([
  '../../../../api',
  '../../../../api/command-patch',
  '../../../../api/selection'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      var boldCommand = new api.CommandPatch('bold');

      boldCommand.execute = function () {
        var selection = new api.Selection();
        var h2Node = selection.getContaining(function (node) {
          return (/^(H[1-6])$/).test(node.nodeName);
        });

        if (! h2Node) {
          api.Command.prototype.execute.apply(this, arguments);
        } else {
          /**
           * TODO: because we manipulate the DOM directly, these will not be
           * added to the undo stack.
           */
          var strongNode;
          if (this.queryState()) {
            // Unwrap STRONG
            strongNode = selection.getContaining(function (node) {
              return node.nodeName === 'B';
            });

            // Remove the containing strongNode
            // TODO: create unwrap function?
            while (strongNode.childNodes.length > 0) {
              h2Node.insertBefore(strongNode.childNodes[0], strongNode);
            }
            h2Node.removeChild(strongNode);
          } else {
            // Wrap in STRONG
            var node = selection.range.commonAncestorContainer;
            strongNode = document.createElement('b');

            // TODO: create wrap function
            node.parentNode.insertBefore(strongNode, node);
            strongNode.appendChild(node);
          }

          editor.pushHistory();
          editor.trigger('content-changed');
        }
      };

      // FIXME: we can't use STRONGs because this would mean we have to
      // re-implement the `queryState` command, which would be difficult…

      editor.patchedCommands.bold = boldCommand;
    };
  };

});