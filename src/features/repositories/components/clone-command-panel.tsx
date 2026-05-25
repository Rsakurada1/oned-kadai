"use client";

import { useState } from "react";

type CloneProtocol = "https" | "ssh";

type CloneCommandPanelProps = {
  httpsUrl: string | null;
  sshUrl: string | null;
};

export function CloneCommandPanel({
  httpsUrl,
  sshUrl,
}: CloneCommandPanelProps) {
  const [protocol, setProtocol] = useState<CloneProtocol>(
    httpsUrl ? "https" : "ssh",
  );
  const [copyStatus, setCopyStatus] = useState("");
  const selectedUrl = protocol === "ssh" ? sshUrl ?? httpsUrl : httpsUrl ?? sshUrl;

  if (!selectedUrl) {
    return null;
  }

  const cloneCommand = `git clone ${selectedUrl}`;

  return (
    <div className="clone-panel">
      <div className="copy-row">
        <code>{selectedUrl}</code>
        <button
          className="button button--secondary copy-button"
          onClick={() => copyText(selectedUrl, "Clone URL")}
          type="button"
        >
          URLをコピー
        </button>
      </div>

      <fieldset className="clone-command">
        <legend>clone command</legend>
        <div className="protocol-switch">
          <button
            aria-pressed={protocol === "https"}
            className={protocol === "https" ? "is-active" : ""}
            disabled={!httpsUrl}
            onClick={() => setProtocol("https")}
            type="button"
          >
            HTTPS
          </button>
          <button
            aria-pressed={protocol === "ssh"}
            className={protocol === "ssh" ? "is-active" : ""}
            disabled={!sshUrl}
            onClick={() => setProtocol("ssh")}
            type="button"
          >
            SSH
          </button>
        </div>
        <div className="copy-row">
          <code>{cloneCommand}</code>
          <button
            className="button button--secondary copy-button"
            onClick={() => copyText(cloneCommand, "clone command")}
            type="button"
          >
            コマンドをコピー
          </button>
        </div>
      </fieldset>

      <p aria-live="polite" className="copy-status">
        {copyStatus}
      </p>
    </div>
  );

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label}をコピーしました。`);
    } catch {
      setCopyStatus("クリップボードにコピーできませんでした。");
    }
  }
}
