import { ResponseData } from '../types/codingProblem';


const SERVER_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export async function runCode(code: string, language: string) {
  try {
    const response = await fetch(`${SERVER_URL}/run`, {
        method: 'POST',
        headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
    });
    const result:ResponseData = await response.json();
  } catch (error) {
    console.error('Error executing code:', error);
  }
}

export async function judgeCode(code: string, language: string, problemId: string) {
  const response = await fetch(`${SERVER_URL}/submit`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language, problemId }),
  });

  const result: ResponseData = await response.json();
  return result;
}