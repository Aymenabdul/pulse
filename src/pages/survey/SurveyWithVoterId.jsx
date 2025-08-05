import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent
} from "@mui/material";
import { useNavigate } from "react-router";

export default function SurveyWithVoterId({ from }) {
  const navigate = useNavigate();

  const voterData = {
    voterId: "TN123456789",
    fullName: "Ravi Kumar",
    age: 32,
    gender: "Male",
    houseNumber: "12B",
    whatsappNumber: "9876543210"
  };

  const [form, setForm] = useState({
    voterStatus: "",
    voterType: "",
    vote2016: "",
    vote2021: "",
    vote2026: "",
    cm2017to2021: "",
    cm2021to2026: "",
    mlaPerformance: ""
  });

  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form Submitted:", form);
    setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
  };

  const handleClear = () => {
    setForm({
      voterStatus: "",
      voterType: "",
      vote2016: "",
      vote2021: "",
      vote2026: "",
      cm2017to2021: "",
      cm2021to2026: "",
      mlaPerformance: ""
    });
  };

  const handleBack = () => {
    if (from === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/surveyor/home");
    }
  };

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">
        Back
      </Button>

      <Card sx={{ mb: 3, backgroundColor: "#f5f5f5" }}>
        <CardContent>
          <Typography variant="h5" textAlign="center">Voter Details</Typography>
          <Typography mt={1}><strong>Voter ID:</strong> {voterData.voterId}</Typography>
          <Typography mt={1}><strong>Name:</strong> {voterData.fullName}</Typography>
          <Typography mt={1}><strong>Age:</strong> {voterData.age}</Typography>
          <Typography mt={1}><strong>Gender:</strong> {voterData.gender}</Typography>
          <Typography mt={1}><strong>House Number:</strong> {voterData.houseNumber}</Typography>
          <Typography mt={1}><strong>WhatsApp:</strong> {voterData.whatsappNumber}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {[
          {
            label: "What is the Voter's status?",
            field: "voterStatus",
            options: [
              "In Current Address",
              "Moved to another address in the same constituency",
              "Moved to different constituency",
              "Working abroad",
              "Passed away"
            ]
          },
          {
            label: "Voter Type",
            field: "voterType",
            options: ["Party Member", "Party Supporter", "Public", "Another Party Member"]
          },
          {
            label: "Who did you vote for in 2016?",
            field: "vote2016",
            options: [
              "AIADMK", "DMK", "BJP", "INC", "NTK", "VCK", "MDMK", "CPI", "CPM", "PMK", "DMDK",
              "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
            ]
          },
          {
            label: "Who did you vote for in 2021?",
            field: "vote2021",
            options: [
              "AIADMK", "DMK", "BJP", "INC", "NTK", "VCK", "MDMK", "CPI", "CPM", "PMK", "DMDK",
              "MNM", "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
            ]
          },
          {
            label: "Who will you vote for in 2026?",
            field: "vote2026",
            options: [
              "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", "CPI", "CPM", "PMK",
              "DMDK", "MNM", "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
            ]
          },
          {
            label: "Performance of CM Edappadi K. Palaniswami (2017–2021)?",
            field: "cm2017to2021",
            options: ["Bad", "Average", "Good", "Very good"]
          },
          {
            label: "Performance of CM Stalin (2021–2026)?",
            field: "cm2021to2026",
            options: ["Bad", "Average", "Good", "Very good"]
          },
          {
            label: "Performance of your current MLA?",
            field: "mlaPerformance",
            options: ["Bad", "Average", "Good", "Very good"]
          }
        ].map(({ label, field, options }) => (
          <Grid size={{ xs: 12 }} key={field}>
            <Card>
              <CardContent>
                <Typography fontWeight={600} mb={1}>{label}</Typography>
                <Grid container spacing={1}>
                  {options.map((option) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={option}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form[field] === option}
                            onChange={() => handleChange(field, option)}
                          />
                        }
                        label={option}
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            transition: "0.2s",
                            "&:hover": { fontSize: "1.05rem" }
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={3} display="flex" gap={2} justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          Clear
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
