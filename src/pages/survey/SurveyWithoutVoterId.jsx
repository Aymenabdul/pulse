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
  FormLabel,
  CircularProgress
} from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

const MemoizedTextField = memo(({ label, field, value, onChange, type = "text", error, helperText }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => {
      let inputValue = e.target.value;
      
      // For phone number fields, only allow digits and limit to 10 characters
      if (type === "tel") {
        inputValue = inputValue.replace(/\D/g, '').slice(0, 10);
      }
      
      onChange(field, inputValue);
    }}
    margin="normal"
    type={type}
    error={error}
    helperText={helperText}
    slotProps={type === "tel" ? { 
      input: {
        pattern: "[0-9]{10}",
        maxLength: 10,
        inputMode: "numeric"
      }
    } : {}}
  />
));

MemoizedTextField.displayName = 'MemoizedTextField';

const MemoizedRadioGroup = memo(({ label, field, options, value, onChange, required = false }) => (
  <div>
    <Typography fontWeight={600} mb={1}>
      {label}
      {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
    </Typography>
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

const FormField = memo(({ label, field, options, isInput, value, onChange, type, required = false, error, helperText }) => (
  <Grid size={{ xs: 12 }}>
    <Card sx={{
      backgroundColor: "rgba(255, 255, 255, 0.25)",  
      backdropFilter: "blur(10px)", 
    }}>
      <CardContent>
        {isInput ? (
          <div>
            <Typography fontWeight={600} mb={1}>
              {label}
              {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
            </Typography>
            <MemoizedTextField
              label={label}
              field={field}
              value={value}
              onChange={onChange}
              type={type}
              error={error}
              helperText={helperText}
            />
          </div>
        ) : (
          <MemoizedRadioGroup
            label={label}
            field={field}
            options={options}
            value={value}
            onChange={onChange}
            required={required}
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
  const [loading, setLoading] = useState(false);
  const [voterData, setVoterData] = useState(null);
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
    religion: "",
    ques1: "",
    ques2: "",
    ques3: "",
    ques4: "",
    ques5: "",
    ques6: ""
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const idFromParams = searchParams.get('id');

  const validatePhoneNumber = useCallback((number, fieldName) => {
    if (!number) return null; // Optional field
    
    if (!/^\d{10}$/.test(number)) {
      return `${fieldName} must be exactly 10 digits`;
    }
    
    return null;
  }, []);

  useEffect(() => {
    const errors = {};
    
    const phoneError = validatePhoneNumber(form.phoneNumber, "Phone number");
    if (phoneError) errors.phoneNumber = phoneError;
    
    const whatsappError = validatePhoneNumber(form.whatsappNumber, "WhatsApp number");
    if (whatsappError) errors.whatsappNumber = whatsappError;
    
    setValidationErrors(errors);
  }, [form.phoneNumber, form.whatsappNumber, validatePhoneNumber]);

  const fetchActiveSurveys = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/file/active');
      setActiveSurveys(response.data);
    } catch (error) {
      let message = error?.response ? error?.response?.data.message : "Error loading active surveys." 
      setAlert({ open: true, type: "error", message: message });
    }
  }, []);

  const fetchExistingSurvey = useCallback(async (id) => {
    if (!id) return;
    
    try {
      const response = await axiosInstance.get(`/survey/survey-by-id?id=${id}`);
      
      if (response.data) {
        setExistingSurvey(response.data);
        setIsEditing(true);
        
        setForm(prev => ({
          ...prev,
          name: response.data.name || "",
          age: response.data.age || "",
          gender: response.data.gender || "",
          houseNumber: response.data.houseNumber || "",
          phoneNumber: response.data.phoneNumber || "",
          whatsappNumber: response.data.whatsappNumber || "",
          voterStatus: response.data.voterStatus || "",
          voterType: response.data.voter_type || "",
          religion : response.data.religion || "",
          ques1: response.data.ques1 || "",
          ques2: response.data.ques2 || "",
          ques3: response.data.ques3 || "",
          ques4: response.data.ques4 || "",
          ques5: response.data.ques5 || "",
          ques6: response.data.ques6 || ""
        }));
        
        if (response.data.surveyName) {
          setSelectedSurveyName(response.data.surveyName);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setAlert({ open: true, type: "error", message: "Error loading existing survey data." });
      }
    }
  }, []);

  useEffect(() => {
    fetchActiveSurveys();
  }, [fetchActiveSurveys]);

  useEffect(() => {
    if (idFromParams) {
      fetchExistingSurvey(idFromParams);
    }
  }, [idFromParams, fetchExistingSurvey]);

  const handleSurveyChange = (event) => {
    const newSurveyName = event.target.value;
    setSelectedSurveyName(newSurveyName);
    
    setForm(prev => ({
      ...prev,
      voterStatus: "",
      voterType: "",
      ques1: "",
      ques2: "",
      ques3: "",
      ques4: "",
      ques5: "",
      ques6: ""
    }));
    
    setExistingSurvey(null);
    setIsEditing(false);
    
    if (idFromParams && newSurveyName) {
      fetchExistingSurvey(idFromParams);
    }
  };

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedSurveyName) {
      setAlert({ open: true, type: "error", message: "Please select a survey first." });
      return;
    }

    if (!form.voterStatus) {
      setAlert({ open: true, type: "error", message: "Voter status is required. Please select one." });
      return;
    }

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setAlert({ open: true, type: "error", message: "Please fix the validation errors before submitting." });
      return;
    }

    try {
      if (isEditing && existingSurvey && idFromParams) {
        const updatePayload = {
          name: form.name,
          age: form.age,
          gender: form.gender,
          houseNumber: form.houseNumber,
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
          religion: form.religion,
          surveyName: selectedSurveyName,
          userId: user?.id,
          updated_by: user?.name,
          role: user?.role,
          verified: existingSurvey.verified || true,
          created_by: existingSurvey.created_by || user?.name,
          voted: existingSurvey.voted || false,
          id: existingSurvey.id
        };
        
        const updateUrl = `/survey/update-by-id?surveyName=${selectedSurveyName}&id=${idFromParams}`;
        
        await axiosInstance.put(updateUrl, updatePayload);

        console.log("update payload",updatePayload);
        
        
        setAlert({ open: true, type: "success", message: "Survey updated successfully!" });

        setTimeout(() => handleBack(), 2000);
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
          religion: form.religion,
          surveyName: selectedSurveyName,
          userId: user?.id,
          verified: true,
          created_by: user?.name,
          role: user?.role,
          voted: false
        };

        await axiosInstance.post('/survey/submit', submitPayload);

        setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
        
        setTimeout(() => handleBack(), 2000);
      }
      
    } catch (e) {
      
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
  }, [form, user?.id, user?.name, user?.role, selectedSurveyName, isEditing, existingSurvey, idFromParams, validationErrors]);

  const handleClear = useCallback(() => {
    setForm({
      name: "",
      age: "",
      gender: "",
      phoneNumber: "",
      whatsappNumber: "",
      voterStatus: "",
      voterType: "",
      ques1: "",
      ques2: "",
      ques3: "",
      ques4: "",
      ques5: "",
      ques6: "",
      surveyName: ""
    });
    setValidationErrors({});
  }, []);

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
      label: "Religion",
      field: "religion",
      options: ["Hindu", "Muslim", "christian","others"]
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
      ],
      required: true
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading voter data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">
        Back
      </Button>

      <Typography variant="h4" align="center" gutterBottom>
        Survey Without Voter ID
      </Typography>
      
      {voterData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Voter data loaded for: {voterData.name || 'N/A'}
        </Alert>
      )}
      
      <Box mb={3}>
        <Card sx={{
          backgroundColor: "rgba(255, 255, 255, 0.25)",  
          backdropFilter: "blur(10px)", 
        }}>
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
                {activeSurveys?.map((survey, index) => (
                  <MenuItem key={index} value={survey}>
                    {survey}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Box>
      
      {isEditing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have already submitted this survey. You can update your responses below.
        </Alert>
      )}

      <Grid container spacing={2}>
        {formFields.map(({ label, field, options, isInput, type, required }) => (
          <FormField
            key={field}
            label={label}
            field={field}
            options={options}
            isInput={isInput}
            value={form[field]}
            onChange={handleChange}
            type={type}
            required={required}
            error={!!validationErrors[field]}
            helperText={validationErrors[field]}
          />
        ))}
      </Grid>

      <Box mt={3} display="flex" gap={2} justifyContent="center">
        <Button 
          variant="contained" 
          color={buttonColor} 
          onClick={handleSubmit}
          disabled={Object.keys(validationErrors).length > 0}
        >
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