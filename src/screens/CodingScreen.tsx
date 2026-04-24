import CodeEditor from "../components/CodeEditor";


const CodingScreen = ({ route }: any) => {
  const { exercise } = route.params;

  return (
    <CodeEditor
      language={exercise.language}
      problemId={exercise.id}
      startCode={exercise.starterCode}
    problemQuestion={exercise.title}
    problemDescription={exercise.description}
    courseId={exercise.courseId}
    difficulty={exercise.difficulty}
    />
  );
};

export default CodingScreen;