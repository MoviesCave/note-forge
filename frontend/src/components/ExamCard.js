import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDateTime, formatDeadline } from "../utils";
import { apiRoute } from "../utils";
import Modal from "./Modal";
import DateTimePicker from "./DateTimePicker";
import { FilePen, Trash2 } from "lucide-react";
import "./ExamCard.scss";
import authStore from "../authStore";

const ExamCard = ({ data, refresh, setRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [deadline, setDeadline] = useState("");
  const authenticated = authStore((state) => state.authenticated);
  const sessionCookie = authStore((state) => state.getSessionCookie);
  const role = authStore((state) => state.getUserRole);
  const { formattedDate, formattedTime } = formatDateTime(data.deadline);
  const id = authStore((state) => state.getUserId);
  const navigate = useNavigate();

  const openModal = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };
  const closeModal = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${apiRoute}/exams/edit`, {
        cookie: sessionCookie,
        id: data.id,
        title,
        deadline,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setRefresh(!refresh);
        setShowModal(false);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(err.response.data);
      } else {
        toast.error("Something went wrong. Try Again");
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${apiRoute}/exams/remove`, {
        cookie: sessionCookie,
        id: data.id,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setRefresh(!refresh);
        setShowModal(false);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(err.response.data);
      } else {
        toast.error("Something went wrong. Try Again");
      }
    }
  };

  return (
    <div className="exam-card" onClick={() => navigate(`/exams/${data.id}`)}>
      <div className="content">
        <p> {data.title}</p>
        <p> {formatDeadline(data.deadline)}</p>
      </div>
      {authenticated && (role === "admin" || data.userId === id) && (
        <div className="actions">
          <FilePen className="icon" onClick={openModal} />
          <Modal show={showModal} onClose={closeModal}>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEdit();
                }
              }}
            />
            <DateTimePicker
              onDateTimeChange={setDeadline}
              text="Edit deadline"
              initialDate={formattedDate}
              initialTime={formattedTime}
            />
            <button className="primary-action-button" onClick={handleEdit}>
              Save
            </button>
            <button className="secondary-action-button" onClick={closeModal}>
              Cancel
            </button>
          </Modal>
          {role === "admin" && (
            <Trash2 className="icon delete" onClick={handleDelete} />
          )}
        </div>
      )}
    </div>
  );
};

export default ExamCard;
