export function decodeGitHubContent(content: string): string {
  return Buffer.from(content, 'base64').toString('utf-8');
}
