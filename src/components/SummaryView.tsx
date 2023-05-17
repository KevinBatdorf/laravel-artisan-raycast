import { useAI } from "@raycast/utils";
import { ConsoleCommand } from "../types";
import { Action, ActionPanel, Detail, Icon } from "@raycast/api";

export const SummaryView = ({ command }: { command: ConsoleCommand }) => {
  const prompt = `In the context of Laravel Artisan only, teach me about following command. Format the response as if you are providing documentation and do not repeat the command. You may use code blocks.\nCommand: laravel artisan ${command.name}\nDescription: ${command.description}`;
  const { data, isLoading } = useAI(prompt, { creativity: 0 });
  const code = data.match(/```[\w\S]*\n([\s\S]*?)\n```/);
  return (
    <Detail
      navigationTitle="AI Generated Summary"
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Continue in Chat"
            icon={Icon.SpeechBubble}
            url={`raycast://extensions/raycast/raycast-ai/ai-chat?fallbackText=${encodeURIComponent(prompt)}`}
          />
          {code?.[1] ? (
            <Action.CopyToClipboard title="Copy Snippet To Clipboard" content={code[1].replace(/`{3}/g, "")} />
          ) : null}
        </ActionPanel>
      }
      markdown={data.replace(/^[\W_]+/, "")}
    />
  );
};
