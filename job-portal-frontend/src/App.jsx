import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("jobs");
  const [editingJobId, setEditingJobId] = useState(null);

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    skills: "",
    salary: "",
    description: "",
  });

  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("jobPortalUser");

    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }

    fetchJobs();
  }, []);

  const fetchJobs = () => {
    fetch("http://localhost:8080/api/jobs")
      .then((response) => response.json())
      .then((data) => setJobs(data))
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setMessage("Failed to load jobs");
      });
  };

  const getJobById = (jobId) => {
    return jobs.find((job) => job.id === jobId);
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleJobChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const resetJobForm = () => {
    setJobData({
      title: "",
      company: "",
      location: "",
      jobType: "",
      skills: "",
      salary: "",
      description: "",
    });

    setEditingJobId(null);
  };

  const registerUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);

        if (data.message === "Registration successful") {
          setRegisterData({
            fullName: "",
            email: "",
            password: "",
            role: "CANDIDATE",
          });

          setPage("login");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        setMessage("Registration failed");
      });
  };

  const loginUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);

        if (data.message === "Login successful") {
          setLoggedInUser(data.user);
          localStorage.setItem("jobPortalUser", JSON.stringify(data.user));

          setLoginData({
            email: "",
            password: "",
          });

          setPage("jobs");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setMessage("Login failed");
      });
  };

  const logoutUser = () => {
    localStorage.removeItem("jobPortalUser");
    setLoggedInUser(null);
    setApplications([]);
    setAllApplications([]);
    setMessage("Logout successful");
    setPage("jobs");
  };

  const applyForJob = (jobId) => {
    if (!loggedInUser) {
      setMessage("Please login before applying for a job");
      setPage("login");
      return;
    }

    if (loggedInUser.role === "ADMIN") {
      setMessage("Admin cannot apply for jobs");
      return;
    }

    const applicationData = {
      userId: loggedInUser.id,
      jobId: jobId,
    };

    fetch("http://localhost:8080/api/applications/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error applying for job:", error);
        setMessage("Failed to apply for job");
      });
  };

  const fetchMyApplications = () => {
    if (!loggedInUser) {
      setMessage("Please login to view your applications");
      setPage("login");
      return;
    }

    fetch(`http://localhost:8080/api/applications/user/${loggedInUser.id}`)
      .then((response) => response.json())
      .then((data) => {
        setApplications(data);
        setPage("myApplications");
      })
      .catch((error) => {
        console.error("Error fetching applications:", error);
        setMessage("Failed to load applications");
      });
  };

  const fetchAllApplications = () => {
    fetch("http://localhost:8080/api/applications")
      .then((response) => response.json())
      .then((data) => {
        setAllApplications(data);
        setPage("adminApplications");
      })
      .catch((error) => {
        console.error("Error fetching all applications:", error);
        setMessage("Failed to load applications");
      });
  };

  const updateApplicationStatus = (applicationId, status) => {
    fetch(
      `http://localhost:8080/api/applications/${applicationId}/status?status=${status}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
        fetchAllApplications();
      })
      .catch((error) => {
        console.error("Error updating application status:", error);
        setMessage("Failed to update application status");
      });
  };

  const addJob = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => response.json())
      .then(() => {
        setMessage("Job added successfully");
        resetJobForm();
        fetchJobs();
        setPage("jobs");
      })
      .catch((error) => {
        console.error("Error adding job:", error);
        setMessage("Failed to add job");
      });
  };

  const startEditJob = (job) => {
    setEditingJobId(job.id);

    setJobData({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      jobType: job.jobType || "",
      skills: job.skills || "",
      salary: job.salary || "",
      description: job.description || "",
    });

    setPage("editJob");
  };

  const updateJob = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8080/api/jobs/${editingJobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update job");
        }

        return response.json();
      })
      .then(() => {
        setMessage("Job updated successfully");
        resetJobForm();
        fetchJobs();
        setPage("jobs");
      })
      .catch((error) => {
        console.error("Error updating job:", error);
        setMessage("Failed to update job");
      });
  };

  const deleteJob = (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    fetch(`http://localhost:8080/api/jobs/${jobId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setMessage("Job deleted successfully");
          fetchJobs();
        } else {
          setMessage("Failed to delete job");
        }
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
        setMessage("Failed to delete job");
      });
  };

  const isAdmin = loggedInUser && loggedInUser.role === "ADMIN";

  return (
    <div className="app">
      <header className="header">
  <h1>Job Portal</h1>
  <p>Find jobs, apply easily, and track your application status</p>
</header>

      <nav className="navbar">
        <button onClick={() => setPage("jobs")}>Jobs</button>

        {!loggedInUser && (
          <>
            <button onClick={() => setPage("register")}>Register</button>
            <button onClick={() => setPage("login")}>Login</button>
          </>
        )}

        {loggedInUser && !isAdmin && (
          <button onClick={fetchMyApplications}>My Applications</button>
        )}

        {isAdmin && (
          <>
            <button
              onClick={() => {
                resetJobForm();
                setPage("addJob");
              }}
            >
              Admin Add Job
            </button>

            <button onClick={fetchAllApplications}>Admin Applications</button>
          </>
        )}

        {loggedInUser && (
          <>
            <span className="user-text">
              Hi, {loggedInUser.fullName} ({loggedInUser.role})
            </span>
            <button onClick={logoutUser}>Logout</button>
          </>
        )}
      </nav>

      {message && <p className="message">{message}</p>}

      {page === "register" && (
        <section className="form-section">
          <h2>Candidate Registration</h2>

          <form onSubmit={registerUser} className="form-card">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={registerData.fullName}
              onChange={handleRegisterChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />

            <button type="submit">Register</button>
          </form>
        </section>
      )}

      {page === "login" && (
        <section className="form-section">
          <h2>Login</h2>

          <form onSubmit={loginUser} className="form-card">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />

            <button type="submit">Login</button>
          </form>
        </section>
      )}

      {page === "jobs" && (
        <section className="jobs-section">
          <h2>Available Jobs</h2>

          {jobs.length === 0 ? (
            <p>No jobs available</p>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <h3>{job.title}</h3>

                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>

                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p>
                    <strong>Job Type:</strong> {job.jobType}
                  </p>

                  <p>
                    <strong>Skills:</strong> {job.skills}
                  </p>

                  <p>
                    <strong>Salary:</strong> {job.salary}
                  </p>

                  <p>{job.description}</p>

                  {!isAdmin && (
                    <button onClick={() => applyForJob(job.id)}>
                      Apply Now
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => startEditJob(job)}
                      >
                        Edit Job
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteJob(job.id)}
                      >
                        Delete Job
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {page === "myApplications" && (
        <section className="jobs-section">
          <h2>My Applications</h2>

          {applications.length === 0 ? (
            <p>You have not applied for any jobs yet.</p>
          ) : (
            <div className="job-list">
              {applications.map((application) => {
                const job = getJobById(application.jobId);

                return (
                  <div className="job-card" key={application.id}>
                    <h3>{job ? job.title : `Job ID: ${application.jobId}`}</h3>

                    {job && (
                      <>
                        <p>
                          <strong>Company:</strong> {job.company}
                        </p>

                        <p>
                          <strong>Location:</strong> {job.location}
                        </p>

                        <p>
                          <strong>Salary:</strong> {job.salary}
                        </p>
                      </>
                    )}

                    <p>
                      <strong>Status:</strong> {application.status}
                    </p>

                    <p>
                      <strong>Applied At:</strong> {application.appliedAt}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {page === "adminApplications" && isAdmin && (
        <section className="jobs-section">
          <h2>Admin Applications</h2>

          {allApplications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <div className="job-list">
              {allApplications.map((application) => {
                const job = getJobById(application.jobId);

                return (
                  <div className="job-card" key={application.id}>
                    <h3>Application ID: {application.id}</h3>

                    <p>
                      <strong>User ID:</strong> {application.userId}
                    </p>

                    <p>
                      <strong>Job:</strong>{" "}
                      {job ? job.title : `Job ID: ${application.jobId}`}
                    </p>

                    {job && (
                      <>
                        <p>
                          <strong>Company:</strong> {job.company}
                        </p>

                        <p>
                          <strong>Location:</strong> {job.location}
                        </p>
                      </>
                    )}

                    <p>
                      <strong>Status:</strong> {application.status}
                    </p>

                    <p>
                      <strong>Applied At:</strong> {application.appliedAt}
                    </p>

                    <button
                      className="accept-btn"
                      onClick={() =>
                        updateApplicationStatus(application.id, "ACCEPTED")
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        updateApplicationStatus(application.id, "REJECTED")
                      }
                    >
                      Reject
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {page === "addJob" && isAdmin && (
        <section className="form-section">
          <h2>Admin Add Job</h2>

          <form onSubmit={addJob} className="form-card">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={jobData.title}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={jobData.company}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={jobData.location}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="jobType"
              placeholder="Job Type"
              value={jobData.jobType}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="skills"
              placeholder="Required Skills"
              value={jobData.skills}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="salary"
              placeholder="Salary"
              value={jobData.salary}
              onChange={handleJobChange}
              required
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={jobData.description}
              onChange={handleJobChange}
              required
            ></textarea>

            <button type="submit">Add Job</button>
          </form>
        </section>
      )}

      {page === "editJob" && isAdmin && (
        <section className="form-section">
          <h2>Admin Edit Job</h2>

          <form onSubmit={updateJob} className="form-card">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={jobData.title}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={jobData.company}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={jobData.location}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="jobType"
              placeholder="Job Type"
              value={jobData.jobType}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="skills"
              placeholder="Required Skills"
              value={jobData.skills}
              onChange={handleJobChange}
              required
            />

            <input
              type="text"
              name="salary"
              placeholder="Salary"
              value={jobData.salary}
              onChange={handleJobChange}
              required
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={jobData.description}
              onChange={handleJobChange}
              required
            ></textarea>

            <button type="submit">Update Job</button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                resetJobForm();
                setPage("jobs");
              }}
            >
              Cancel
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default App;