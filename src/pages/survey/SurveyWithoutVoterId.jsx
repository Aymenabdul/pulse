import { useCallback, useState, useEffect, useMemo, memo } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Snackbar,
  Alert,
  FormControl,
  TextField,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormLabel
} from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

const MemoizedTextField = memo(({ label, field, value, onChange, type = "text" }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
    margin="normal"
    type={type}
    slotProps={type === "tel" ? { 
      input: {
        pattern: "[0-9]{10}", maxLength: 10 
      }
    } : {}}
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

const FormField = memo(({ label, field, options, isInput, value, onChange, type }) => (
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
              type={type}
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

export default function SurveyWithoutVoterId() {
  const [existingSurvey, setExistingSurvey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [selectedSurveyName, setSelectedSurveyName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    houseNumber: "",
    phoneNumber: "",
    whatsappNumber: "",
    voterStatus: "",
    voterType: "",
    ques1: "",
    ques2: "",
    ques3: "",
    ques4: "",
    ques5: "",
    ques6: ""
  });

  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  // Fetch active surveys
  const fetchActiveSurveys = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/file/active');
      setActiveSurveys(response.data || []);
    } catch (error) {
      console.error("Error fetching active surveys:", error);
      setAlert({ open: true, type: "error", message: "Error loading active surveys." });
    }
  }, []);

  useEffect(() => {
    fetchActiveSurveys();
  }, [fetchActiveSurveys]);

  // Check if user already has a survey for this surveyName
  const checkExistingSurvey = useCallback(async () => {
    if (!user?.id || !selectedSurveyName) return;
    
    try {
      const response = await axiosInstance.get(`/survey/get-by-survey-name-and-user-id?surveyName=${encodeURIComponent(selectedSurveyName)}&userId=${user.id}`);
      if (response.data) {
        setExistingSurvey(response.data);
        setIsEditing(true);
        
        // Populate form with existing data
        setForm({
          name: response.data.name || "",
          age: response.data.age || "",
          gender: response.data.gender || "",
          houseNumber: response.data.houseNumber || "",
          phoneNumber: response.data.phoneNumber || "",
          whatsappNumber: response.data.whatsappNumber || "",
          voterStatus: response.data.voterStatus || "",
          voterType: response.data.voter_type || "",
          ques1: response.data.ques1 || "",
          ques2: response.data.ques2 || "",
          ques3: response.data.ques3 || "",
          ques4: response.data.ques4 || "",
          ques5: response.data.ques5 || "",
          ques6: response.data.ques6 || ""
        });
      } else {
        // Reset if no existing survey found
        setExistingSurvey(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error checking existing survey:", error);
      // If 404, it means no existing survey, which is fine
      if (error.response?.status !== 404) {
        console.error("Unexpected error:", error);
      } else {
        // Reset state for new survey
        setExistingSurvey(null);
        setIsEditing(false);
      }
    }
  }, [user?.id, selectedSurveyName]);

  useEffect(() => {
    checkExistingSurvey();
  }, [checkExistingSurvey]);

  const handleSurveyChange = (event) => {
    const newSurveyName = event.target.value;
    setSelectedSurveyName(newSurveyName);
    
    // Reset form when changing survey
    setForm({
      name: "",
      age: "",
      gender: "",
      houseNumber: "",
      phoneNumber: "",
      whatsappNumber: "",
      voterStatus: "",
      voterType: "",
      ques1: "",
      ques2: "",
      ques3: "",
      ques4: "",
      ques5: "",
      ques6: ""
    });
    
    // Reset existing survey state
    setExistingSurvey(null);
    setIsEditing(false);
  };

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedSurveyName) {
      setAlert({ open: true, type: "error", message: "Please select a survey first." });
      return;
    }

    try {
      let response;
      
      if (isEditing && existingSurvey) {
        const updatePayload = {
          name: form.name,
          age: form.age,
          gender: form.gender,
          phoneNumber: form.phoneNumber,
          whatsappNumber: form.whatsappNumber,
          voterStatus: form.voterStatus,
          voter_type: form.voterType,
          ques1: form.ques1,
          ques2: form.ques2,
          ques3: form.ques3,
          ques4: form.ques4,
          ques5: form.ques5,
          ques6: form.ques6,
          surveyName: selectedSurveyName,
          userId: user?.id || null,
        };

        const updateUrl = `/survey/update-by-id?surveyName=${encodeURIComponent(selectedSurveyName)}&id=${existingSurvey.id}`;
        
        response = await axiosInstance.put(updateUrl, updatePayload);
        console.log(response.data);
        
        setAlert({ open: true, type: "success", message: "Survey updated successfully!" });
        
      } else {
        const submitPayload = {
          name: form.name,
          age: form.age,
          gender: form.gender,
          phoneNumber: form.phoneNumber,
          whatsappNumber: form.whatsappNumber,
          voterStatus: form.voterStatus,
          voter_type: form.voterType,
          ques1: form.ques1,
          ques2: form.ques2,
          ques3: form.ques3,
          ques4: form.ques4,
          ques5: form.ques5,
          ques6: form.ques6,
          surveyName: selectedSurveyName,
          userId: user?.id || null,
          verified: true,
        };

        response = await axiosInstance.post('/survey/submit', submitPayload);
        console.log(response.data);

        setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
        
        await checkExistingSurvey();
      }
      
    } catch (e) {
      console.error("API Error:", e);
      
      let errorMessage;
      if (e.response?.status === 404) {
        errorMessage = "Survey record not found. Please try again.";
      } else if (e.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else {
        errorMessage = isEditing ? "Error updating survey. Please try again." : "Error submitting survey. Please try again.";
      }
      
      setAlert({ open: true, type: "error", message: errorMessage });
    }
  }, [form, user?.id, selectedSurveyName, isEditing, existingSurvey, checkExistingSurvey]);

  const handleClear = useCallback(() => {
    setForm({
      name: "",
      age: "",
      gender: "",
      houseNumber: "",
      phoneNumber: "",
      whatsappNumber: "",
      voterStatus: "",
      voterType: "",
      ques1: "",
      ques2: "",
      ques3: "",
      ques4: "",
      ques5: "",
      ques6: ""
    });
  }, []);

  // Fixed back navigation to preserve search params
  const handleBack = useCallback(() => {
    const currentPath = location.pathname;
    const currentParams = searchParams.toString();
    const paramString = currentParams ? `?${currentParams}` : '';

    if (currentPath.includes('/admin')) {
      navigate(`/admin/survey/without-voter-id${paramString}`);
    } else if (currentPath.includes('/surveyor')) {
      navigate(`/surveyor/survey/without-voter-id${paramString}`);
    } else {
      navigate(`/${paramString}`);
    }
  }, [location.pathname, navigate, searchParams]);

  const handleCloseAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, open: false }));
  }, []);

  const formFields = useMemo(() => [
    {
      label: "Full Name",
      field: "name",
      isInput: true,
      type: "text"
    },
    {
      label: "Age Range",
      field: "age",
      options: ["18-24", "25-30", "31-35", "36-40", "Above 40"]
    },
    {
      label: "Gender",
      field: "gender",
      options: ["Male", "Female", "Other"]
    },
    {
      label: "Phone Number",
      field: "phoneNumber",
      isInput: true,
      type: "tel"
    },
    {
      label: "WhatsApp Number",
      field: "whatsappNumber",
      isInput: true,
      type: "tel"
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

  const buttonText = isEditing ? "Update" : "Submit";
  const buttonColor = isEditing ? "warning" : "primary";

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">
        Back
      </Button>

      <Typography variant="h4" align="center" gutterBottom>
        Survey Without Voter ID
      </Typography>
      
      {/* Survey Selection */}
      <Box mb={3}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <Typography fontWeight={600} mb={1}>Select Survey</Typography>
              <Select
                value={selectedSurveyName}
                onChange={handleSurveyChange}
                displayEmpty
                sx={{ mt: 1 }}
              >
                <MenuItem value="">
                  <em>Choose a survey</em>
                </MenuItem>
                {activeSurveys.map((survey) => (
                  <MenuItem key={survey.id || survey.surveyName} value={survey.surveyName || survey.name}>
                    {survey.surveyName || survey.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Box>
      
      {selectedSurveyName && (
        <Typography variant="h6" align="center" color="primary" gutterBottom>
          Survey: {selectedSurveyName}
        </Typography>
      )}

      {isEditing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have already submitted this survey. You can update your responses below.
        </Alert>
      )}

      {/* Show form fields by default */}
      <Grid container spacing={2}>
        {formFields.map(({ label, field, options, isInput, type }) => (
          <FormField
            key={field}
            label={label}
            field={field}
            options={options}
            isInput={isInput}
            value={form[field]}
            onChange={handleChange}
            type={type}
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