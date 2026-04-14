export type JudgingResult = {
  expected: string;
  input: string;
  output: string;
  passed: boolean;
  time: number;
};

export type ResponseData = {
  passed: number;
  results: JudgingResult[];
};