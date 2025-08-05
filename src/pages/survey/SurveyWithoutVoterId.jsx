import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Snackbar,
  Alert,
  FormControl,
  FormLabel,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { useNavigate } from "react-router";

const questions = [
  {
    label: "What is your full name?",
    name: "fullName",
    required: true,
    type: "text",
    placeholder: "Enter full name",
  },
  {
    label: "What is your age?",
    name: "age",
    type: "number",
    placeholder: "Enter age",
  },
  {
    label: "What is your gender?",
    name: "gender",
    type: "text",
    placeholder: "Enter gender",
  },
  {
    label: "What is your house number?",
    name: "houseNumber",
    type: "text",
    placeholder: "Enter house number",
  },
];

const multiChoiceQuestions = [
  {
    label: "What is the Voter's status?",
    name: "voterStatus",
    options: [
      "In Current Address",
      "Moved to another address in the same constituency",
      "Moved to different constituency",
      "Working abroad",
      "Passed away",
    ],
  },
  {
    label: "Voter Type:",
    name: "voterType",
    options: [
      "Party Member",
      "Party Supporter",
      "Public",
      "Another Party Member",
    ],
  },
  {
    label: "Who did you vote for 2016?",
    name: "vote2016",
    options: [
      "AIADMK",
      "DMK",
      "BJP",
      "INC",
      "NTK",
      "VCK",
      "MDMK",
      "CPI",
      "CPM",
      "PMK",
      "DMDK",
      "Muslim Parties (Specify)",
      "Others (Specify)",
      "Independent (Specify)",
      "NOTA",
    ],
  },
  {
    label: "Who did you vote for 2021?",
    name: "vote2021",
    options: [
      "AIADMK",
      "DMK",
      "BJP",
      "INC",
      "NTK",
      "VCK",
      "MDMK",
      "CPI",
      "CPM",
      "PMK",
      "DMDK",
      "MNM",
      "Muslim Parties (Specify)",
      "Others (Specify)",
      "Independent (Specify)",
      "NOTA",
    ],
  },
  {
    label: "Who will you vote for 2026?",
    name: "vote2026",
    options: [
      "AIADMK",
      "DMK",
      "BJP",
      "INC",
      "NTK",
      "TVK",
      "VCK",
      "MDMK",
      "CPI",
      "CPM",
      "PMK",
      "DMDK",
      "MNM",
      "Muslim Parties (Specify)",
      "Others (Specify)",
      "Independent (Specify)",
      "NOTA",
    ],
  },
  {
    label: "How is the performance of the then Chief Minister Edappadi K. Palaniswami from 2017-2021?",
    name: "epsPerformance",
    options: ["Bad", "Average", "Good", "Very good"],
  },
  {
    label: "How is the performance of the current Chief Minister Stalin from 2021-2026?",
    name: "stalinPerformance",
    options: ["Bad", "Average", "Good", "Very good"],
  },
  {
    label: "How is the performance of your current MLA?",
    name: "mlaPerformance",
    options: ["Bad", "Average", "Good", "Very good"],
  },
];

export default function SurveyWithoutVoterId({ from }) {
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = (name, option) => {
    setFormData((prev) => {
      const currentValues = prev[name] || [];
      return {
        ...prev,
        [name]: currentValues.includes(option)
          ? currentValues.filter((v) => v !== option)
          : [...currentValues, option],
      };
    });
  };

  const handleSubmit = () => {
    console.log("Submitted:", formData);
    setSnackbar({ open: true, message: "Survey submitted successfully!", severity: "success" });
  };

  const handleClear = () => {
    setFormData({});
    setSnackbar({ open: true, message: "Form cleared.", severity: "info" });
  };

  const handleBack = () => {
    if (from === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/surveyor/home");
    }
  };

  return (
    <Box sx={{ width: "100%", py: 3 }}>
        <Box
            sx={{
            width: { xs: "90%", md: "70%", lg: "60%" },
            mx: "auto",
            }}
        >
            <Button
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={handleBack}
            >
                Back
            </Button>
        </Box>
        <Typography variant="h4" align="center" gutterBottom>
        Survey Without Voter ID
        </Typography>
        <Box
            sx={{
            width: { xs: "90%", md: "70%", lg: "60%" },
            mx: "auto",
            }}
        >
            {questions.map((q) => (
            <Box key={q.name} p={2} my={2} borderRadius={2} boxShadow={2} bgcolor="white">
                <FormControl fullWidth>
                <FormLabel>{q.label}</FormLabel>
                <TextField
                    type={q.type}
                    name={q.name}
                    value={formData[q.name] || ""}
                    onChange={handleChange}
                    placeholder={q.placeholder || ""}
                    required={q.required || false}
                />
                </FormControl>
            </Box>
            ))}

            {multiChoiceQuestions.map((q) => (
            <Box key={q.name} p={2} my={2} borderRadius={2} boxShadow={2} bgcolor="white">
                <FormControl fullWidth>
                <FormLabel>{q.label}</FormLabel>
                <FormGroup>
                    <Grid container spacing={2}>
                    {q.options.map((opt) => (
                        <Grid key={opt} size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                            <Checkbox
                                checked={formData[q.name]?.includes(opt) || false}
                                onChange={() => handleCheck(q.name, opt)}
                            />
                            }
                            label={opt}
                        />
                        </Grid>
                    ))}
                    </Grid>
                </FormGroup>
                </FormControl>
            </Box>
            ))}

            <Box display="flex" gap={2} justifyContent="center" my={4}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClear}>
                Clear
            </Button>
            </Box>

            <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    </Box>
  );
}
