import BeatLoader from "react-spinners/BeatLoader";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <BeatLoader color="#0a0a4f" />
    </div>
  );
};

export default Loading;