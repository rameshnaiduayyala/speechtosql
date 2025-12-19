import axios from "axios";

const run = async (question) => {
  const res = await axios.post(
    "http://183.82.108.168:8000/ask",
    { question },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};

export default run;
