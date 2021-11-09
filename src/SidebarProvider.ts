import * as vscode from "vscode";
import { getNonce } from "./getNonce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  // public static readonly viewType = 'mv-sidebar';

  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri, "media", "reset.css")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri, "media", "vscode.css")
    );

    // const styleMainUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(
    //     this._extensionUri, "dist", "app.css")
    // );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri, "dist", "app.js")
    );

    const nonce = getNonce();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
          style-src 'unsafe-inline' ${webview.cspSource};
          img-src ${webview.cspSource} https:;
          script-src 'nonce-${nonce}';"
        >
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        
        <title>MV</title>
        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
        </script>
      </head>
        <body>
          <div id="app"></div>
          <script src="${scriptUri}" nonce="${nonce}">
        </body>
      </html>
    `;
  }
}
