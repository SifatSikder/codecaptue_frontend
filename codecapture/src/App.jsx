import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import JSZip from "jszip";
import { ToastContainer, toast } from "react-toastify"; // Import Toast components
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles

const API_BASE_URL = "http://127.0.0.1:8000/api";

const CodeCapture = () => {
  const [videos, setVideos] = useState([]);
  const [results] = useState([]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setVideos((prevVideos) => [...prevVideos, ...newFiles]);
  };

  const handleDeleteVideo = (videoToDelete) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video !== videoToDelete));
  };

  const handleGenerate = async (type) => {
    if (type === "Generate Image Notes") {
      toast.info("Generating Image Notes. Please wait..."); // Show loading toast
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
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "images_folder.zip";
            link.click();
          });

          toast.success("Images extracted and zipped into 'images' folder."); // Success toast
        } else {
          toast.error("Failed to upload videos."); // Error toast
        }
      } catch (error) {
        console.error("Error uploading videos:", error);
        toast.error("Error uploading videos."); // Error toast
      }
    }
  };

  const handleDownload = (content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${content.slice(0, 10)}.txt`;
    link.click();

    toast.success("File downloaded successfully!"); // Success toast
  };

  const handleDownloadAll = () => {
    const allContent = results.map((res) => res.content).join("\n\n");
    const blob = new Blob([allContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "all_results.txt";
    link.click();

    toast.success("All files downloaded successfully!"); // Success toast
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-6"
      >
        <h1 className="text-4xl font-bold text-center text-gray-800">Codecapture</h1>

        <div className="flex flex-col space-y-4">
          <label
            htmlFor="file-upload"
            className="block w-full text-center border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-gray-700 cursor-pointer"
          >
            Upload Video/Videos
            <input id="file-upload" type="file" multiple accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Video Previews with Delete Option */}
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

          {/* Buttons for Actions */}
          {videos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {[
                "Extract Source Code",
                "Generate Workflow",
                "Generate Transcription and Summary",
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
                <CardContent className="p-4">
                  <p className="text-gray-700">{result.content}</p>
                </CardContent>
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
      </motion.div>

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
