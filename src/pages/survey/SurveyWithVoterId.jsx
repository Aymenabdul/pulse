import { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControl,
  TextField
} from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

const MemoizedTextField = memo(({ label, field, value, onChange }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    margin="normal"
    type="tel"
    slotProps={{ 
      input: {
        pattern: "[0-9]{10}", maxLength: 10 
      }
    }}
  />
));

MemoizedTextField.displayName = 'MemoizedTextField';

const MemoizedRadioGroup = memo(({ label, field, options, value, onChange }) => (
  <div>
    <Typography fontWeight={600} mb={1}>{label}</Typography>
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      >
        <Grid container spacing={1}>
          {options.map((option) => (
            <Grid size={{ xs: 12, sm: 6 }} key={option}>
              <FormControlLabel
                value={option}
                control={<Radio />}
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
      </RadioGroup>
    </FormControl>
  </div>
));

MemoizedRadioGroup.displayName = 'MemoizedRadioGroup';

const FormField = memo(({ label, field, options, isInput, value, onChange }) => (
  <Grid size={{ xs: 12 }}>
    <Card>
      <CardContent>
        {isInput ? (
          <div>
            <Typography fontWeight={600} mb={1}>{label}</Typography>
            <MemoizedTextField
              label={label}
              field={field}
              value={value}
              onChange={onChange}
            />
          </div>
        ) : (
          <MemoizedRadioGroup
            label={label}
            field={field}
            options={options}
            value={value}
            onChange={onChange}
          />
        )}
      </CardContent>
    </Card>
  </Grid>
));

FormField.displayName = 'FormField';

const VoterDetails = memo(({ voter }) => (
  <Card sx={{ mb: 3, backgroundColor: "#f5f5f5" }}>
    <CardContent>
      <Typography variant="h5" textAlign="center">Voter Details</Typography>
      <Typography mt={1}><strong>Voter ID:</strong> {voter?.voterID}</Typography>
      <Typography mt={1}><strong>Name:</strong> {voter?.name}</Typography>
      <Typography mt={1}><strong>Age:</strong> {voter?.age}</Typography>
      <Typography mt={1}><strong>Gender:</strong> {voter?.gender}</Typography>
      <Typography mt={1}><strong>House Number:</strong> {voter?.houseNumber}</Typography>
    </CardContent>
  </Card>
));

VoterDetails.displayName = 'VoterDetails';

export default function SurveyWithVoterId() {
  const [voter, setVoter] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    ques1: "",
    ques2: "",
    ques3: "",
    ques4: "",
    ques5: "",
    ques6: "",
    phoneNumber: "",
    whatsappNumber: "",
    voterStatus: "",
    voterType: ""
  });

  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const handleFetchSurveyData = useCallback(async (fileDataId) => {
    try {
      const response = await axiosInstance.get(`/survey/survey-by-fileid?fileDataId=${fileDataId}`);
      const surveyData = response.data;
      setSurveyData(surveyData);
      
      setForm({
        ques1: surveyData.ques1 || "",
        ques2: surveyData.ques2 || "",
        ques3: surveyData.ques3 || "",
        ques4: surveyData.ques4 || "",
        ques5: surveyData.ques5 || "",
        ques6: surveyData.ques6 || "",
        phoneNumber: surveyData.phoneNumber || "",
        whatsappNumber: surveyData.whatsappNumber || "",
        voterStatus: surveyData.voterStatus || "",
        voterType: surveyData.voter_type || "",
        userId: user?.id
      });
    } catch (error) {
      console.error("Error fetching survey data:", error);
      setSurveyData(null);
    }
  }, [user?.id]);

  const handleFetchVoterData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/file/getFileData/${id}`);
      console.log(response.data);
      setVoter(response.data);
      
      if (response.data?.voted) {
        await handleFetchSurveyData(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching voter data:", error);
      return null;
    }
  }, [id, handleFetchSurveyData]);

  useEffect(() => {
    handleFetchVoterData();
  }, [handleFetchVoterData]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      let response;
      
      if (voter?.voted) {
        if (!voter?.surveyName) {
          setAlert({ open: true, type: "error", message: "Survey name is missing. Cannot update survey." });
          return;
        }
        
        if (!voter?.id) {
          setAlert({ open: true, type: "error", message: "Voter ID is missing. Cannot update survey." });
          return;
        }
        
        const updatePayload = {
          phoneNumber: form.phoneNumber,
          voter_type: form.voterType, 
          booth: voter?.booth,
          constituency: voter?.assemblyConstituency,
          houseNumber: voter?.houseNumber,
          gender: voter?.gender,
          name: voter?.name,
          voterId: voter?.voterID,
          voterStatus: form.voterStatus, 
          whatsappNumber: form.whatsappNumber, 
          ques1: form.ques1,
          ques2: form.ques2,
          ques3: form.ques3,
          ques4: form.ques4,
          ques5: form.ques5,
          ques6: form.ques6,
          surveyName: voter.surveyName,
          userId: user?.id || null,
          updatedBy: user?.name,
          role: user?.role
        };
        console.log(updatePayload);
        const updateUrl = `/survey/update-by-fileid?surveyName=${voter.surveyName}&fileDataId=${voter.id}`;
        
        response = await axiosInstance.put(updateUrl, updatePayload);
        console.log(response.data);
        
        setAlert({ open: true, type: "success", message: "Survey updated successfully!" });
        
        handleBack();
        
      } else {
        const submitPayload = {
          fileDataId: voter?.id,
          phoneNumber: form.phoneNumber,
          voter_type: form.voterType, 
          userId: user?.id || null, 
          verified: true, 
          booth: voter?.booth,
          constituency: voter?.assemblyConstituency,
          houseNumber: voter?.houseNumber,
          gender: voter?.gender,
          name: voter?.name,
          voterId: voter?.voterID,
          voterStatus: form.voterStatus, 
          whatsappNumber: form.whatsappNumber, 
          ques1: form.ques1,
          ques2: form.ques2,
          ques3: form.ques3,
          ques4: form.ques4,
          ques5: form.ques5,
          ques6: form.ques6,
          createdBy: user?.name,
          role: user?.role
        };

        response = await axiosInstance.post('/survey/submit', submitPayload);
        console.log(response.data);

        setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
        
        await handleFetchVoterData();
      }
      
    } catch (e) {
      console.error("API Error:", e);
      
      let errorMessage;
      if (e.response?.status === 404) {
        errorMessage = "Survey record not found. Please check if the survey exists.";
      } else if (e.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else {
        errorMessage = voter?.voted ? "Error updating survey. Please try again." : "Error submitting survey. Please try again.";
      }
      
      setAlert({ open: true, type: "error", message: errorMessage });
      handleBack();
    }
  }, [voter, form, user?.id, handleFetchVoterData]);

  const handleClear = useCallback(() => {
    setForm({
      ques1: "",
      ques2: "",
      ques3: "",
      ques4: "",
      ques5: "",
      ques6: "",
      phoneNumber: "",
      whatsappNumber: "",
      voterStatus: "",
      voterType: ""
    });
  }, []);

  const handleBack = useCallback(() => {
    const currentPath = location.pathname;
    const currentParams = searchParams.toString();
    const paramString = currentParams ? `?${currentParams}` : '';

    if (currentPath.includes('/admin')) {
      navigate(`/admin/survey/with-voter-id${paramString}`);
    } else if (currentPath.includes('/surveyor')) {
      navigate(`/surveyor/survey/with-voter-id${paramString}`);
    } else {
      navigate(`/${paramString}`);
    }
  }, [location.pathname, navigate, searchParams]);

  const handleCloseAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, open: false }));
  }, []);

  const formFields = useMemo(() => [
    {
      label: "Phone Number",
      field: "phoneNumber",
      isInput: true
    },
    {
      label: "WhatsApp Number",
      field: "whatsappNumber",
      isInput: true
    },
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
      field: "ques1",
      options: [
        "AIADMK", "DMK", "BJP", "INC", "NTK", "VCK", "MDMK", "CPI", "CPM", "PMK", "DMDK",
        "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
      ]
    },
    {
      label: "Who did you vote for in 2021?",
      field: "ques2",
      options: [
        "AIADMK", "DMK", "BJP", "INC", "NTK", "VCK", "MDMK", "CPI", "CPM", "PMK", "DMDK",
        "MNM", "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
      ]
    },
    {
      label: "Who will you vote for in 2026?",
      field: "ques3",
      options: [
        "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", "CPI", "CPM", "PMK",
        "DMDK", "MNM", "Muslim Parties (Specify)", "Others (Specify)", "Independent (Specify)", "NOTA"
      ]
    },
    {
      label: "Performance of CM Edappadi K. Palaniswami (2017–2021)?",
      field: "ques4",
      options: ["Bad", "Average", "Good", "Very good"]
    },
    {
      label: "Performance of CM Stalin (2021–2026)?",
      field: "ques5",
      options: ["Bad", "Average", "Good", "Very good"]
    },
    {
      label: "Performance of your current MLA?",
      field: "ques6",
      options: ["Bad", "Average", "Good", "Very good"]
    }
  ], []);

  const buttonText = voter?.voted ? "Update" : "Submit";
  const buttonColor = voter?.voted ? "warning" : "primary";

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">
        Back
      </Button>

      <VoterDetails voter={voter} />

      <Grid container spacing={2}>
        {formFields.map(({ label, field, options, isInput }) => (
          <FormField
            key={field}
            label={label}
            field={field}
            options={options}
            isInput={isInput}
            value={form[field]}
            onChange={handleChange}
          />
        ))}
      </Grid>

      <Box mt={3} display="flex" gap={2} justifyContent="center">
        <Button variant="contained" color={buttonColor} onClick={handleSubmit}>
          {buttonText}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          Clear
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}