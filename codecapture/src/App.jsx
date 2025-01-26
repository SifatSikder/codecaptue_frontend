import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const CodeCapture = () => {
  const [videos, setVideos] = useState([]);
  const [results, setResults] = useState([]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setVideos((prevVideos) => [...prevVideos, ...newFiles]);
  };

  const handleGenerate = async (type) => {
    if (type === "Extract Source Code") {
      try {
        const formData = new FormData();
        videos.forEach((video) => {
          formData.append("videos", video);
        });

        const response = await fetch(`${API_BASE_URL}/hello/`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // const newResults = data.results.map((result, index) => ({
          //   id: index,
          //   type,
          //   content: result,
          // }));
          // setResults((prev) => [...prev, ...newResults]);
        } else {
          console.error("Failed to extract source code.");
        }
      } catch (error) {
        console.error("Error extracting source code:", error);
      }
    } else {
      const newResults = videos.map((video, index) => ({
        id: index,
        type,
        content: `${type} for ${video.name}`,
      }));
      setResults((prev) => [...prev, ...newResults]);
    }
  };

  const handleDownload = (content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${content.slice(0, 10)}.txt`;
    link.click();
  };

  const handleDownloadAll = () => {
    const allContent = results.map((res) => res.content).join("\n\n");
    const blob = new Blob([allContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "all_results.txt";
    link.click();
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {["Extract Source Code", "Generate Workflow", "Generate Transcription and Summary", "Generate Image Notes", "Generate All"].map(
              (label) => (
                <Button
                  key={label}
                  onClick={() => handleGenerate(label)}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600"
                >
                  {label}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Video Previews */}
        {videos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Previews</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="space-y-2">
                  <video width="320" height="240" controls>
                    <source src={URL.createObjectURL(video)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-center text-gray-700">{video.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
