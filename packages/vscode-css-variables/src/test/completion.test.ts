/* --------------------------------------------------------------------------------------------
 * Copyright (c) Vu Nguyen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import {
  getDocUri,
  activate,
  positionOf,
} from './helper';

suite('Should do completion', () => {
  const docUri = getDocUri('test.css');

  test.only('Completes in css file', async () => {
    await testCompletion(docUri, 'color: -^', (completionList) => {
      assertItem(completionList, {
        label: '--chakra-ring-offset-width',
        kind: vscode.CompletionItemKind.Variable,
      });

      assertItem(completionList, {
        label: '--chakra-ring-color',
        kind: vscode.CompletionItemKind.Color,
      });

      assertOrder(completionList, [
        '--size-1',
        '--size-2',
        '--size-10'
      ]);

    });
  });
});

async function testCompletion(
  docUri: vscode.Uri,
  searchText: string,
  then: (actualCompletionList: vscode.CompletionList) => void,
) {
  await activate(docUri);

  const position = positionOf(searchText);
  const toPosition = position.with(position.line, position.character);

  // Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
  const actualCompletionList = await vscode.commands.executeCommand<vscode.CompletionList>(
    'vscode.executeCompletionItemProvider',
    docUri,
    toPosition,
  );

  then(actualCompletionList);
}

function assertItem(actualCompletionList: vscode.CompletionList, expectedItem) {
  const actualItem = actualCompletionList.items.find((item) => {
    if (typeof item.label === 'string') {
      return item.label === expectedItem.label;
    }
  });

  assert.ok(actualItem);
  assert.strictEqual(actualItem.label, expectedItem.label);
  assert.strictEqual(actualItem.kind, expectedItem.kind);
}

function assertOrder(actualCompletionList: vscode.CompletionList, expectedItems) {
  const expectedItemsSet = new Set(expectedItems);

  const actualOrder = actualCompletionList.items.reduce((acc, item) => {
    if (typeof item.label === 'string' && expectedItemsSet.has(item.label)) {
      acc.push(item.label);
    }
    return acc;
  }, []);

  assert.deepStrictEqual(actualOrder, expectedItems);
}