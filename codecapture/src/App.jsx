import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader, CardFooter } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import JSZip from "jszip";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const CodeCapture = () => {
  const [videos, setVideos] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [imageZip, setImageZip] = useState(null);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setVideos((prevVideos) => [...prevVideos, ...newFiles]);
  };

  const handleDeleteVideo = (videoToDelete) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video !== videoToDelete));
  };

  const handleGenerate = async (type) => {
    if (type === "Generate Image Notes") {
      toast.info("Generating Image Notes. Please wait...");
      setIsLoading(true);
      setProgress(1);

      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 98) {
            return prevProgress + 1;
          }
          return prevProgress;
        });
      }, 1000);

      setIntervalId(interval);

      try {
        const formData = new FormData();
        videos.forEach((video) => {
          formData.append("videos", video);
        });

        const response = await fetch(`${API_BASE_URL}/generate_notes/`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const zip = await JSZip.loadAsync(blob);

          const imagesFolder = "./images";
          const imagesZip = new JSZip();

          Object.keys(zip.files).forEach((filename) => {
            const fileData = zip.files[filename];
            imagesZip.file(`${imagesFolder}/${filename}`, fileData.async("blob"));
          });

          imagesZip.generateAsync({ type: "blob" }).then((content) => {
            setImageZip(content);
          });

          let gradualProgress = 98;
          const gradualInterval = setInterval(() => {
            if (gradualProgress < 100) {
              setProgress(gradualProgress);
              gradualProgress++;
            } else {
              clearInterval(gradualInterval);
              setProgress(100);
              toast.success("Images extracted and zipped into 'images' folder.");
            }
          }, 100);
        } else {
          toast.error("Failed to upload videos.");
        }
      } catch (error) {
        console.error("Error uploading videos:", error);
        toast.error("Error uploading videos.");
      } finally {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    } else if (type === "Transcribe Video") {
      toast.info("Transcribing Video. Please wait...");
      setIsLoading(true);
      setProgress(1);

      const interval = setInterval(() => {
        setProgress((prevProgress) => (prevProgress < 98 ? prevProgress + 1 : prevProgress));
      }, 1000);

      setIntervalId(interval);

      try {
        const formData = new FormData();
        videos.forEach((video) => {
          formData.append("videos", video);
        });

        const response = await fetch(`${API_BASE_URL}/transcribe_video/`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.transcriptions) {
            setResults((prevResults) => [
              ...prevResults,
              ...data.transcriptions.map((t) => ({
                id: t.filename,
                type: "Transcription",
                content: t.content,
              })),
            ]);
            console.log(data.transcriptions);
            toast.success("Video transcription completed successfully!");
          } else {
            toast.error("No transcriptions found.");
          }

          let gradualProgress = 98;
          const gradualInterval = setInterval(() => {
            if (gradualProgress < 100) {
              setProgress(gradualProgress);
              gradualProgress++;
            } else {
              clearInterval(gradualInterval);
              setProgress(100);
            }
          }, 100);
        } else {
          toast.error("Failed to transcribe videos.");
        }
      } catch (error) {
        console.error("Error transcribing videos:", error);
        toast.error("Error transcribing videos.");
      } finally {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    } else if (type === "Generate Summary") {
      toast.info("Summarizing Video. Please wait...");
      setIsLoading(true);
      setProgress(1);

      const interval = setInterval(() => {
        setProgress((prevProgress) => (prevProgress < 98 ? prevProgress + 1 : prevProgress));
      }, 1000);

      setIntervalId(interval);

      try {
        const formData = new FormData();
        videos.forEach((video) => {
          formData.append("videos", video);
        });

        const response = await fetch(`${API_BASE_URL}/summarize_video/`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.summaries) {
            setResults((prevResults) => [
              ...prevResults,
              ...data.summaries.map((t) => ({
                id: t.filename,
                type: "Summary",
                content: t.content,
              })),
            ]);
            console.log(data.summaries);
            toast.success("Video summarization completed successfully!");
          } else {
            toast.error("No summaries found.");
          }

          let gradualProgress = 98;
          const gradualInterval = setInterval(() => {
            if (gradualProgress < 100) {
              setProgress(gradualProgress);
              gradualProgress++;
            } else {
              clearInterval(gradualInterval);
              setProgress(100);
            }
          }, 100);
        } else {
          toast.error("Failed to summarize videos.");
        }
      } catch (error) {
        console.error("Error summarizing videos:", error);
        toast.error("Error summarizing videos.");
      } finally {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    }
  };

  const handleDownload = (content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${content.slice(0, 10)}.txt`;
    link.click();

    toast.success("File downloaded successfully!");
  };

  const handleDownloadAll = () => {
    const allContent = results.map((res) => res.content).join("\n\n");
    const blob = new Blob([allContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "all_results.txt";
    link.click();

    toast.success("All files downloaded successfully!");
  };

  const handleDownloadImages = () => {
    if (imageZip) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageZip);
      link.download = "images_folder.zip";
      link.click();
      toast.success("Images folder downloaded successfully!");
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

        <div className="space-y-4 mt-6">
          {results.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="bg-gray-100 p-4 font-semibold">{result.type}</CardHeader>
                <CardBody className="p-4">
                  <p className="text-gray-700">{result.content}</p>
                </CardBody>
                <CardFooter className="p-4 flex justify-end">
                  <Button onClick={() => handleDownload(result.content)} className="bg-blue-500 text-white hover:bg-blue-600">
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-6 text-center">
            <Button onClick={handleDownloadAll} className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600">
              Download All
            </Button>
          </div>
        )}

        {imageZip && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-700">Generated Notes</p>
              <Button onClick={handleDownloadImages} className="bg-green-500 text-white hover:bg-green-600">
                Download Notes
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
