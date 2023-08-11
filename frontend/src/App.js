import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "./App.css";
import io from "socket.io-client";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import axios from "axios";
import ReactPlayer from "react-player";

function App() {
  const [show, setShow] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState();
  const [videoList, setVideoList] = useState([]);
  const [streamedVideo, setStreamedVideo] = useState(null);
  const socket = io.connect("http://localhost:3001");

  useEffect(() => {
    socket.on("stream", (data) => {
      setStreamedVideo(data);
    });
  }, [socket]);

  const handleSelected = (video) => {
    socket.emit("requestVideoList", video);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedVideo) {
      const formData = new FormData();
      formData.append("video", uploadedVideo);

      try {
        const res = await axios.post(
          "http://localhost:3001/upload-video",
          formData
        );
        setUploadedVideo("");
        setShow(false);
      } catch (err) {
        console.log("Error:", err);
      }
    }
  };

  const handleSelect = (e) => {
    setUploadedVideo(e.target.files[0]);
  };

  useEffect(() => {
    const fetchVideoList = async () => {
      try {
        const res = await axios.get("http://localhost:3001/videos");
        setVideoList(res.data.files);
      } catch (err) {
        console.log("Error:", err);
      }
    };

    fetchVideoList();
  }, [uploadedVideo]);

  return (
    <>
      <div
        className="header bg-secondary"
        style={{ height: "70px", maxWidth: "100%" }}
      >
        <h1 className="pt-2">Task</h1>
      </div>
      <div className="container">
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" onClick={() => setShow(true)}>
            Add Video
          </button>
        </div>
        <div className="row justify-content-center mt-3">
          <ul className="list-group">
            {videoList.map((video, index) => (
              <li className="list-group-item" key={index}>
                {index + 1}
                {"."}
                <button
                  className="btn"
                  style={{ color: "blue" }}
                  onClick={() => handleSelected(video)}
                >
                  {video}
                </button>
              </li>
            ))}
          </ul>
          {streamedVideo && (
            <div className="video-layer">
              <button
                className="close-button"
                onClick={() => setStreamedVideo(null)}
              >
                Close
              </button>
              <div className="video-container">
                <ReactPlayer
                  url={URL.createObjectURL(
                    new Blob([streamedVideo], { type: "video/mp4" })
                  )}
                  className="react-player"
                  controls
                  playing
                />
              </div>
            </div>
          )}
        </div>

        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Video</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Control type="file" onChange={handleSelect} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default App;
