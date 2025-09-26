// /types/index.ts
export type FileProps = {
  name: string;
  language: string;
  content: string;
};

export type TestCaseProps = {
  input: string;
  expected: string;
  result: string;
  status: 'pass' | 'fail' | 'pending';
};

export type MessageProps = {
  user: string;
  content: string;
  time: string;
};
