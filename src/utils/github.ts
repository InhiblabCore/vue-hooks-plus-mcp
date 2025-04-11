// @ts-ignore
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });


// Get repo file content
export async function getFileContent(owner: string, repo: string, path: string, ref?: string) {
  try {
    const response = await octokit.request(`GET /repos/{owner}/{repo}/contents/{path}`, {
      owner,
      repo,
      path,
      ref,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.data;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}