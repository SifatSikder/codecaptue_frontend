/* eslint-disable react/prop-types */
import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://127.0.0.1:8000";
// const BASE_URL = "https://8c1a-35-240-251-29.ngrok-free.app";
const API_BASE_URL = `${BASE_URL}/api`;

const endpoints = {
  "Generate Image Notes": "/generate_notes/",
  "Transcribe Video": "/transcribe_video/",
  "Generate Summary": "/summarize_video/",
  "Extract Source Code": "/extract_source_code/",
  "Generate Workflow": "/extract_workflow/",
  "Generate All": "/generate_all/",
};

const ProgressModal = ({ isLoading, progress }) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-semibold mb-4">Processing... Please wait</h2>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%`, transition: "width 0.1s ease" }}></div>
        </div>
        <p className="text-center mt-4">{progress}%</p>
      </div>
    </div>
  );
};

const UploadSection = ({ onUpload, videos, onDelete }) => (
  <div className="flex flex-col space-y-4">
    <label
      htmlFor="file-upload"
      className="block w-full text-center border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-gray-700 cursor-pointer"
    >
      Upload Video/Videos
      <input id="file-upload" type="file" multiple accept="video/*" onChange={onUpload} className="hidden" />
    </label>

    {videos.length > 0 && (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Previews</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="space-y-2">
              <div className="relative">
                <video width="320" height="240" controls>
                  <source src={URL.createObjectURL(video)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  onClick={() => onDelete(video)}
                  className="absolute top-0 right-0 text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  &times;
                </button>
              </div>
              <p className="text-center text-gray-700">{video.name}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ActionButtons = ({ labels, onGenerate }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
    {labels.map((label) => (
      <Button
        key={label}
        onClick={() => onGenerate(label)}
        className="bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600"
      >
        {label}
      </Button>
    ))}
  </div>
);

const DownloadSection = ({ zips, downloadHandlers }) => (
  <div className="mt-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
    {Object.entries(zips).map(
      ([key, zip]) =>
        zip && (
          <div key={key} className="flex justify-between items-center mb-2">
            <p className="font-bold text-gray-700">{key}</p>
            <Button onClick={downloadHandlers[key]} className="bg-green-500 text-white hover:bg-green-600">
              Download {key}
            </Button>
          </div>
        )
    )}
  </div>
);

const CodeCapture = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zips, setZips] = useState({});

  const handleGenerate = async (type) => {
    if (!endpoints[type]) return;

    toast.info(`${type}. Please wait...`);
    setIsLoading(true);
    setProgress(1);

    const intervalId = setInterval(() => {
      setProgress((prev) => (prev < 98 ? prev + 1 : prev));
    }, 1000);

    try {
      const formData = new FormData();
      videos.forEach((video) => formData.append("videos", video));

      const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error(`Failed to ${type.toLowerCase()}.`);
        return;
      }

      const blob = await response.blob();
      setZips((prev) => ({ ...prev, [type]: blob }));

      setProgress(100);
      toast.success(`${type} completed successfully.`);
    } catch (error) {
      console.error(`Error during ${type.toLowerCase()}:`, error);
      toast.error(`Error during ${type.toLowerCase()}.`);
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    setVideos((prevVideos) => [...prevVideos, ...Array.from(e.target.files)]);
  };

  const handleDeleteVideo = (videoToDelete) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video !== videoToDelete));
  };

  const downloadHandlers = Object.keys(zips).reduce((handlers, key) => {
    handlers[key] = () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zips[key]);
      link.download = `${key.toLowerCase().replace(/ /g, "_")}.zip`;
      link.click();
      toast.success(`${key} downloaded successfully!`);
    };
    return handlers;
  }, {});

  const hasResults = Object.keys(zips).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-6"
      >
        <h1 className="text-4xl font-bold text-center text-gray-800">CodeCapture</h1>

        <UploadSection onUpload={handleFileUpload} videos={videos} onDelete={handleDeleteVideo} />

        {videos.length > 0 && <ActionButtons labels={Object.keys(endpoints)} onGenerate={handleGenerate} />}

        {/* Conditionally render the results section */}
        {hasResults && <DownloadSection zips={zips} downloadHandlers={downloadHandlers} />}
      </motion.div>

      <ProgressModal isLoading={isLoading} progress={progress} />
      <ToastContainer />
    </div>
  );
};

const App = () => <CodeCapture />;

export default App;
