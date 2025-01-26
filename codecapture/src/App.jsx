import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@material-tailwind/react";
import JSZip from "jszip";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const CodeCapture = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [noteZip, setNoteZip] = useState(null);
  const [codeZip, setCodeZip] = useState(null);
  const [workflowZip, setWorkflowZip] = useState(null);
  const [summaryZip, setSummaryZip] = useState(null);
  const [transcriptionZip, setTranscriptionZip] = useState(null);
  const [allResultsZip, setAllResultsZip] = useState(null);

  const handleGenerate = async (type) => {
    const endpoints = {
      "Generate Image Notes": "/generate_notes/",
      "Transcribe Video": "/transcribe_video/",
      "Generate Summary": "/summarize_video/",
      "Extract Source Code": "/extract_source_code/",
      "Generate Workflow": "/extract_workflow/",
      "Generate All": "/generate_all/",
    };

    const zipSetters = {
      "Generate Image Notes": setNoteZip,
      "Transcribe Video": setTranscriptionZip,
      "Generate Summary": setSummaryZip,
      "Extract Source Code": setCodeZip,
      "Generate Workflow": setWorkflowZip,
      "Generate All": setAllResultsZip,
    };

    if (!endpoints[type]) {
      console.error("Invalid generation type:", type);
      return;
    }

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
      const zip = await JSZip.loadAsync(blob);
      const extractedZip = new JSZip();

      await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
          const fileData = zip.files[filename];
          extractedZip.file(filename, await fileData.async("blob"));
        })
      );

      const content = await extractedZip.generateAsync({ type: "blob" });
      zipSetters[type](content);

      let gradualProgress = 98;
      const gradualInterval = setInterval(() => {
        if (gradualProgress < 100) {
          setProgress(gradualProgress++);
        } else {
          clearInterval(gradualInterval);
          setProgress(100);
          toast.success(`${type} completed successfully.`);
        }
      }, 100);
    } catch (error) {
      console.error(`Error during ${type.toLowerCase()}:`, error);
      toast.error(`Error during ${type.toLowerCase()}.`);
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setVideos((prevVideos) => [...prevVideos, ...newFiles]);
  };

  const handleDeleteVideo = (videoToDelete) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video !== videoToDelete));
  };

  const handleNote = () => {
    if (noteZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(noteZip);
      link.download = "generated_note.zip";
      link.click();
      toast.success("Generated Note downloaded successfully!");
    }
  };

  const handleSourceCode = () => {
    if (codeZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(codeZip);
      link.download = "extracted_source_code.zip";
      link.click();
      toast.success("Source Code downloaded successfully!");
    }
  };

  const handleWorkflow = () => {
    if (workflowZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(workflowZip);
      link.download = "generated_workflow.zip";
      link.click();
      toast.success("Workflow downloaded successfully!");
    }
  };
  const handleSummary = () => {
    if (summaryZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(summaryZip);
      link.download = "generated_summary.zip";
      link.click();
      toast.success("Summary downloaded successfully!");
    }
  };
  const handleTranscription = () => {
    if (transcriptionZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(transcriptionZip);
      link.download = "generated_transcription.zip";
      link.click();
      toast.success("Transcription downloaded successfully!");
    }
  };
  const handleAllResults = () => {
    if (allResultsZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(allResultsZip);
      link.download = "all_results.zip";
      link.click();
      toast.success("All results downloaded successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-6"
      >
        <h1 className="text-4xl font-bold text-center text-gray-800">CodeCapture</h1>
        <div className="flex flex-col space-y-4">
          <label
            htmlFor="file-upload"
            className="block w-full text-center border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-gray-700 cursor-pointer"
          >
            Upload Video/Videos
            <input id="file-upload" type="file" multiple accept="video/*" onChange={handleFileUpload} className="hidden" />
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
                        onClick={() => handleDeleteVideo(video)}
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

          {videos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {[
                "Extract Source Code",
                "Generate Workflow",
                "Transcribe Video",
                "Generate Summary",
                "Generate Image Notes",
                "Generate All",
              ].map((label) => (
                <Button
                  key={label}
                  onClick={() => handleGenerate(label)}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600"
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {noteZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Generated Notes</p>
              <Button onClick={handleNote} className="bg-green-500 text-white hover:bg-green-600">
                Download Notes
              </Button>
            </div>
          </div>
        )}
        {codeZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Extracted Source Codes</p>
              <Button onClick={handleSourceCode} className="bg-green-500 text-white hover:bg-green-600">
                Download Source Code
              </Button>
            </div>
          </div>
        )}
        {workflowZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Extracted Workflow</p>
              <Button onClick={handleWorkflow} className="bg-green-500 text-white hover:bg-green-600">
                Download Workflow
              </Button>
            </div>
          </div>
        )}
        {summaryZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Extracted Summary</p>
              <Button onClick={handleSummary} className="bg-green-500 text-white hover:bg-green-600">
                Download Summary
              </Button>
            </div>
          </div>
        )}
        {transcriptionZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Extracted Transcription</p>
              <Button onClick={handleTranscription} className="bg-green-500 text-white hover:bg-green-600">
                Download Transcription
              </Button>
            </div>
          </div>
        )}
        {allResultsZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Extracted All Results</p>
              <Button onClick={handleAllResults} className="bg-green-500 text-white hover:bg-green-600">
                Download All Results
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Generating Image Notes...Please wait</h2>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%`, transition: "width 0.1s ease" }}></div>
            </div>
            <p className="text-center mt-4">{progress}%</p>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <>
      <CodeCapture />
    </>
  );
};

export default App;
