import { useEffect, useState, useCallback, useMemo, memo, Fragment } from "react";
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
  Select,
  MenuItem,
  Checkbox,
  RadioGroup,
  InputLabel,
  FormControl,
  TextField
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

const casteOptions = [
  "Adi Andhra", "Adi Dravida", "Adi Karnataka", "Adiyan", "Agamudayar",
  "Agaram Vellan Chettiar", "Ajila", "Alwar, Azhavar and Alavar", "Ambalakarar",
  "Ambalakarar (Thanjavur etc.)", "Ambalakkarar (Suriyanur)", "Andipandaram", "Ansar",
  "Appanad Kondayam Kottai Maravar", "Aranadan", "Arayar", "Archakarai Vellala",
  "Arunthathiyar", "Aryavathi", "Attur Kilnad Koravars", "Attur Melnad Koravars",
  "Ayira Vaisyar", "Ayyanavar", "Badagar", "Baira", "Bakuda", "Bandi", "Battu Turkas",
  "Bellara", "Bestha, Siviar", "Bharatar", "Bhatraju", "Billava", "Bondil",
  "Boyar, Oddar", "Boyas", "Boyas (except)", "C.K. Koravars", "C.S.I. formerly S.I.U.C.",
  "Chakkala", "Chakkala (except)", "Chakkiliyan", "Chalavadi", "Chamar, Muchi",
  "Chandala", "Changyampudi Koravars", "Chavalakarar", "Cheruman", "Chettinad Valayars",
  "Chettu or Chetty", "Chowdry", "Dabi Koravars", "Dasari", "Dekkani Muslims",
  "Devagudi Talayaris", "Devangar, Sedar", "Devendrakulathan", "Dobba Koravars",
  "Dobbai Korachas", "Dom, Dombara, Paidi, Pano", "Domban", "Dombs", "Dombs (except)",
  "Dommara", "Dommars", "Donga Boya", "Donga Dasaris", "Donga Dasaris (except)",
  "Donga Ur. Korachas", "Dudekula", "Enadi", "Eravallan", "Eravallar", "Ezhavathy",
  "Ezhuthachar", "Ezhuva", "Gandarvakottai Kallars", "Gandarvakottai Koravars",
  "Gangavar", "Gavara, Gavarai & Vadugar", "Godagali", "Godda", "Gorrela Dodda Boya",
  "Gosargi", "Gounder", "Gowda", "Gudu Dasaris", "Hegde", "Holeya", "Idiga",
  "Illathu Pillaimar", "Inji Koravars", "Irular", "Isaivellalar", "Jaggali",
  "Jambavanodai", "Jambuvanodai", "Jambuvulu", "Jangam", "Jhetty", "Jogi", "Jogis",
  "Jogis (except)", "Kabbera", "Kadaiyan", "Kadar", "Kaikolar, Sengunthar", "Kakkalan",
  "Kal Oddars", "Kala Koravars", "Kaladi (except)", "Kaladis", "Kalari Kurup",
  "Kalavathila Boyas", "Kalingi", "Kalinji Dabikoravars", "Kalladi", "Kallar",
  "Kallar Kula Thondaman", "Kalveli Gounder", "Kambar", "Kammalar or Viswakarma",
  "Kammara", "Kanakkan, Padanna", "Kani, Kanisu, Kaniyar Panikkar", "Kanikaran, Kanikkar",
  "Kaniyala Vellalar", "Kaniyan, Kanyan", "Kannada Saineegar", "Kannadiya Naidu",
  "Karimpalan", "Karpoora Chettiar", "Karuneegar", "Kasukkara Chettiar",
  "Katesar Pattamkatti", "Kathikarar", "Kattunayakan", "Kavara", "Kavuthiyar",
  "Kepmaris", "Kerala Mudali", "Kharvi", "Khatri", "Kochu Velan", "Koliyan",
  "Konda Kapus", "Kondareddis", "Kongu Chettiar", "Kongu Vaishnava", "Kongu Vellalars",
  "Koosa", "Kootan, Koodan", "Kootappal Kallars", "Koppala Velama", "Koracha",
  "Koraga", "Koravars", "Kota", "Koteyar", "Krishnanvaka", "Kudikara Vellalar",
  "Kudiya, Melakudi", "Kudumban", "Kudumbi", "Kuga Vellalar", "Kulala", "Kunchidigar",
  "Kunnuvar Mannadi", "Kuravan, Sidhanar", "Kurichchan", "Kuruhini Chetty", "Kurumans",
  "Kurumba, Kurumba Goundar", "Kurumbas", "Labbais including Rowthar and Marakayar",
  "Lambadi", "Latin Catholic Christian Vannar", "Latin Catholics",
  "Latin Catholics in Shenkottah", "Lingayat", "Madari", "Madiga", "Maha Malasar",
  "Mahendra, Medara", "Mahratta", "Maila", "Mala", "Malai Arayan", "Malai Pandaram",
  "Malai Vedan", "Malakkuravan", "Malasar", "Malayakandi", "Malayali", "Malayar", "Male",
  "Maniagar", "Mannan", "Mannan", "Mapilla", "Maravars", "Maravars (except)",
  "Maruthuvar, Navithar, Mangala", "Mavilan", "Meenavar", "Moger", "Mond Golla",
  "Monda Golla", "Monda Koravars", "Moondrumandai Enbathunalu", "Mooppan",
  "Moundadan Chetty", "Mudugar, Muduvan", "Mukkuvar or Mukayar", "Mundala", "Muthuraja",
  "Muthuvan", "Mutlakampatti", "Mutlakampatti", "Nadar, Shanar & Gramani", "Nagaram",
  "Naikkar", "Nalakeyava", "Nangudi Vellalar", "Nanjil Mudali", "Narikoravar", "Nayadi",
  "Nellorepet Oddars", "Nokkar", "Nokkars", "Nulayar", "O.P.S. Vellalar", "Odar",
  "Oddars", "Odiya", "Oottruvalanattu Vellalar", "Orphans and destitutes children",
  "Ovachar", "Padannan", "Padayachi", "Pagadai", "Paiyur Kotta Vellalar", "Pallan",
  "Pallayan", "Palliyan", "Palliyar", "Pambada", "Pamulu", "Panan", "Panar", "Panchama",
  "Pandiya Vellalar", "Panisaivan", "Paniyan", "Pannadi", "Pannayar", "Panniandi",
  "Pannirandam Chettiar", "Paraiyan, Parayan, Sambavar", "Paravan", "Paravar",
  "Paravar converts to Christianity", "Parkavakulam", "Pathiyan", "Pedda Boyas", "Perike",
  "Periya Suriyur Kallars", "Perumkollar", "Piramalai Kallars", "Podikara Vellalar",
  "Ponnai Koravars", "Pooluva Gounder", "Poraya", "Pulavar", "Pulayan, Cheramar",
  "Pulluvan", "Pulluvar", "Punnan Vettuva Gounder", "Punnan Vettuva Gounder", "Pusala",
  "Puthirai Vannan", "Raneyar", "Reddy (Ganjam)", "Sadhu Chetty", "Sakkaraithamadai Koravars",
  "Sakkaravar or Kavathi", "Salem Melnad Koravars", "Salem Uppu Koravars", "Salivagana",
  "Saliyar", "Samagara", "Samban", "Sapari", "Saranga Palli Koravars",
  "Sathatha Srivaishnava", "Savalakkarar", "Sembanad Maravars", "Semman", "Senaithalaivar",
  "Serakula Vellalar", "Servai", "Servai", "Sheik", "Sholaga", "Sooramari Oddars",
  "Sourashtra", "Sozhia Chetty", "Sozhia Vellalar", "Srisayar", "Sundaram Chetty", "Syed",
  "Telugupatty Chetty", "Telungapatti Chettis", "Thalli Koravars", "Thandan",
  "Thogamalai Koravars", "Thogatta Veerakshatriya", "Tholkollar", "Tholuva Naicker",
  "Thondaman", "Thoraiyar (Nilgiris)", "Thoraiyar (Plains)", "Thoriyar", "Thoti",
  "Thottia Naicker", "Thottia Naickers", "Tiruvalluvar", "Toda", "Ukkirakula Kshatriya Naicker",
  "Uppara", "Uppukoravars", "Urali Gounder", "Urali Gounders", "Uraly",
  "Urikkara Nayakkar", "Vaduvarpatti Koravars", "Valaiyar", "Valayars", "Vallambar",
  "Vallanattu Chettiar", "Vallon", "Valluvan", "Valmiki", "Vaniyar", "Vannan",
  "Vannar (Salaivai Thozhilalar)", "Vanniakula Kshatriya", "Varaganeri Koravars",
  "Vathiriyan", "Veduvar and Vedar", "Veerasaiva", "Velan", "Velar", "Vellan Chettiar",
  "Veluthodathu Nair", "Venganur Adi-Dravidar", "Veppur Parayan", "Vetan",
  "Vetta Koravars", "Vettaikarar", "Vettaikarar", "Vettiyan", "Vettuva Gounder",
  "Vettuva Gounder", "Vettuvan", "Virakodi Vellala", "Vokkaligar",
  "Wayalpad or Nawalpeta Korachas", "Wynad Chetty", "Yadhava", "Yavana", "Yerukula", "Yogeeswarar", "Others (Specify)",
];

const partyOptions = [
    "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", 
    "CPI", "CPM", "PMK", "DMDK", "MNM", "Muslim Parties (Specify)"
];

const specifyQuestions = {
  ques1: true,
  ques2: true,
  ques3: true,
  ques7: true,
  religion: true,
  gender: true,
  caste: true,
  occupation: true,
};

const MemoizedTextField = memo(({ label, field, value, onChange, type = "text" }) => {
  const handleInputChange = (e) => {
    let inputValue = e.target.value;
    const fieldName = field.toLowerCase();

    if (fieldName.includes('number')) {
      inputValue = inputValue.replace(/[^0-9]/g, '').slice(0, 10);
    }
    else if (fieldName.endsWith('_specify')) {
      inputValue = inputValue.replace(/[^A-Za-z ]/g, '');
    }

    onChange(field, inputValue);
  };

  return (
    <div>
      <Typography fontWeight={600} mb={1}>{label}</Typography>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={handleInputChange}
        margin="normal"
        type={type}
      />
    </div>
  );
});
MemoizedTextField.displayName = 'MemoizedTextField';

const MemoizedSelect = memo(({ label, field, options, value, onChange, isSpecifyQuestion, specifyValue, required }) => {
  const requiresSpecify = isSpecifyQuestion && typeof value === 'string' && value.includes('(Specify)');

  return (
    <div>
      <Typography fontWeight={600} mb={1}>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '4px', fontSize: '23px' }}>*</span>}
      </Typography>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => onChange(field, e.target.value)}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {options.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {requiresSpecify && (
        <MemoizedTextField
          label="Please Specify"
          field={`${field}_specify`}
          value={specifyValue}
          onChange={onChange}
        />
      )}
    </div>
  );
});
MemoizedSelect.displayName = 'MemoizedSelect';

const MemoizedRadioGroup = memo(({ label, field, options, value, onChange, required }) => (
  <div>
    <Typography fontWeight={600} mb={1}>
      {label}
      {required && <span style={{ color: 'red', marginLeft: '4px', fontSize: '23px' }}>*</span>}
    </Typography>
    <FormControl component="fieldset" fullWidth>
      <RadioGroup value={value} onChange={(e) => onChange(field, e.target.value)}>
        <Grid container spacing={1}>
          {options.map((option) => (
            <Grid size={{xs:6, sm:6, md:6}} key={option}>
              <FormControlLabel value={option} control={<Radio />} label={option} />
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </FormControl>
  </div>
));
MemoizedRadioGroup.displayName = 'MemoizedRadioGroup';

const MemoizedMultiSelectRadio = memo(({ label, field, options, value, onChange }) => {
  const handleToggle = (option) => {
    const newSelected = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange(field, newSelected);
  };

  return (
    <div>
      <Typography fontWeight={600} mb={1}>{label}</Typography>
      <FormControl component="fieldset" fullWidth>
        <Grid container spacing={1}>
          {options.map((option) => (
            <Grid size={{xs:6, sm:6, md:3}} key={option}>
              <FormControlLabel control={<Checkbox checked={value.includes(option)} onChange={() => handleToggle(option)} />} label={option} />
            </Grid>
          ))}
        </Grid>
      </FormControl>
    </div>
  );
});
MemoizedMultiSelectRadio.displayName = 'MemoizedMultiSelectRadio';

// --- MODIFIED: Logic is corrected to use Radio buttons by default ---
const FormField = memo(({ label, field, options, isInput, value, onChange, specifyValue, required }) => {
  const isSpecifyQuestion = specifyQuestions[field];
  const requiresSpecify = useMemo(() => {
    if (!isSpecifyQuestion || !value) return false;
    if (Array.isArray(value)) return value.some(item => typeof item === 'string' && item.includes('(Specify)'));
    if (typeof value === 'string') return value.includes('(Specify)');
    return false;
  }, [isSpecifyQuestion, value]);

  return (
    <Grid size={{xs:12}}>
      <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
        <CardContent>
          {isInput ? (
            <MemoizedTextField
              label={label}
              field={field}
              value={value}
              onChange={onChange}
              type={field.toLowerCase().includes('number') ? 'tel' : 'text'}
            />
          ) : field === 'caste' ? ( // Caste uses a dropdown
            <MemoizedSelect
              label={label}
              field={field}
              options={options}
              value={value}
              onChange={onChange}
              isSpecifyQuestion={isSpecifyQuestion}
              specifyValue={specifyValue}
              required={required}
            />
          ) : field === "ques7" ? ( // ques7 uses multi-select checkboxes
            <div>
              <MemoizedMultiSelectRadio label={label} field={field} options={options} value={value} onChange={onChange} />
              {requiresSpecify && (
                <MemoizedTextField
                  label="Please Specify"
                  field={`${field}_specify`}
                  value={specifyValue}
                  onChange={onChange}
                />
              )}
            </div>
          ) : ( // All other questions now correctly use Radio Buttons
            <div>
              <MemoizedRadioGroup label={label} field={field} options={options} value={value} required={required} onChange={onChange} />
              {requiresSpecify && (
                <MemoizedTextField
                  label="Please Specify"
                  field={`${field}_specify`}
                  value={specifyValue}
                  onChange={onChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
});
FormField.displayName = 'FormField';

const VoterDetails = memo(({ voter }) => (
    <Card sx={{ mb: 3, backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
        <CardContent>
            <Typography variant="h5" textAlign="center">Voter Details</Typography>
            <Typography mt={1}><strong>Voter ID:</strong> {voter?.voterID}</Typography>
            <Typography mt={1}><strong>Name:</strong> {voter?.name}</Typography>
            <Typography mt={1}><strong>Age:</strong> {voter?.age}</Typography>
            <Typography mt={1}><strong>Gender:</strong> {voter?.gender}</Typography>
            <Typography mt={1}><strong>House Number:</strong> {voter?.houseNumber}</Typography>
            <Typography mt={1}><strong>Relation Type:</strong> {voter?.relationType}</Typography>
            <Typography mt={1}><strong>Relation Name:</strong> {voter?.relationName}</Typography>
            <Typography mt={1}><strong>Section:</strong> {voter?.section}</Typography>
        </CardContent>
    </Card>
));
VoterDetails.displayName = 'VoterDetails';

export default function SurveyWithVoterId() {
  const [voter, setVoter] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { id, surveyName } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState({
    ques1: "", ques1_specify: "",
    ques2: "", ques2_specify: "",
    ques3: "", ques3_specify: "",
    caste_specify: "",
    occupation: "",
    ques4: "", ques5: "", ques6: "",
    ques7: [],
    caste: "", religion: "",
    phoneNumber: "", whatsappNumber: "",
    voterStatus: "",
    voterType: "",
    partyName: "",
    supportingParty: "",
    gender_specify: "",
    religion_specify: "",
    ques7_specify: "",
    occupation_specify: "",
  });
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const formFields = useMemo(() => [
    { label: "What is the Voter's status?", field: "voterStatus", options: ["In Current Address", "Moved to another address in the same constituency", "Moved to different constituency", "Working abroad", "Passed away"], required: true },
    { label: "Voter Type", field: "voterType", options: ["Public", "Party Member"] },
    { label: "Occupation / Employment Status", field: "occupation", options: ["Student", "Homemaker", "Unemployed", "Self-employed", "Farmer", "Daily wage laborer", "Private sector employee", "Government employee", "Professional", "Retired", "Others (Specify)"] },
    { label: "Religion", field: "religion", options: ["Hindu", "Muslim", "Christian", "Others (Specify)"] },
    { label: "Caste", field: "caste", options: casteOptions },
    { label: "Phone Number", field: "phoneNumber", isInput: true },
    { label: "WhatsApp Number", field: "whatsappNumber", isInput: true },
    { label: "Who did you vote for in 2016?", field: "ques1", options: partyOptions.filter(p => !['TVK', 'MNM'].includes(p)) },
    { label: "Who did you vote for in 2021?", field: "ques2", options: partyOptions.filter(p => p !== 'TVK') },
    { label: "Who will you vote for in 2026?", field: "ques3", options: partyOptions },
    { label: "Performance of CM Edappadi K. Palaniswami (2017–2021)?", field: "ques4", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Performance of CM Stalin (2021–2026)?", field: "ques5", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Performance of your current MLA?", field: "ques6", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Important issues in this constituency?", field: "ques7", options: ["Traffic", "Poor Roads", "Flood", "Drainage", "Waterlogging", " No Flyover", "NEET", "Mosquitos", "Garbage", "Water supply", "Crop harvest disruption", "Pollution", "Public health crisis", "Women safety", "Unemployment", "Bus Services", "Train services", "Land grabbing", "No Electricity", "Inflation", "Caste conflict", "Others (Specify)"] },
  ], []);

  const handleFetchSurveyData = useCallback(async (fileDataId) => {
    try {
      const response = await axiosInstance.get(`/survey/survey-by-fileid?fileDataId=${fileDataId}`);
      const data = response.data;
      
      // --- FIX: Explicitly map voter_type from backend to voterType in frontend state ---
      const newFormState = { 
        ...data, 
        voterType: data.voter_type || data.voterType || '', // Handles both snake_case and camelCase
        ques7: data.ques7 || [] 
      };

      Object.keys(specifyQuestions).forEach(field => {
        const value = data[field];
        if (Array.isArray(value)) {
          const specifyAnswer = value.find(item => item.includes(': '));
          const otherAnswers = value.filter(item => !item.includes(': '));
          if (specifyAnswer) {
            const specifyText = specifyAnswer.split(': ')[1];
            const formFieldWithOptions = formFields.find(f => f.field === field);
            const specifyPlaceholder = formFieldWithOptions?.options.find(opt => opt.includes('(Specify)'));
            newFormState[field] = [...otherAnswers, specifyPlaceholder];
            newFormState[`${field}_specify`] = specifyText;
          } else {
            newFormState[field] = value;
          }
        } else if (typeof value === 'string' && value.includes(': ')) {
          const parts = value.split(': ');
          const optionPart = parts[0].trim();
          const specifyPart = parts.slice(1).join(': ').trim();
          const formFieldWithOptions = formFields.find(f => f.field === field);
          const matchingOption = formFieldWithOptions?.options.find(opt => opt.startsWith(optionPart));
          if (matchingOption) {
            newFormState[field] = matchingOption;
            newFormState[`${field}_specify`] = specifyPart;
          }
        } else {
          newFormState[field] = value || (Array.isArray(form[field]) ? [] : '');
        }
      });

      setForm(prev => ({ ...prev, ...newFormState }));
    } catch (error) {
      console.error("Error fetching survey data:", error);
    }
  }, [formFields]);

  const handleFetchVoterData = useCallback(async () => {
    try {
      const voterResponse = await axiosInstance.get(`/file/getFileData/${id}`);
      setVoter(voterResponse.data);
      const fileDataId = voterResponse.data?.id;

      if (fileDataId) {
        const statusResponse = await axiosInstance.get(`/survey/voters/${fileDataId}`);
        const isVerifiedStatus = statusResponse.data?.isVerified || false;
        setIsVerified(isVerifiedStatus);
        if (isVerifiedStatus) {
          handleFetchSurveyData(fileDataId);
        }
      }
    } catch (error) {
      setIsVerified(false);
      console.error("Error fetching voter data or status:", error);
    }
  }, [id, handleFetchSurveyData]);

  useEffect(() => {
    handleFetchVoterData();
  }, [handleFetchVoterData]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => {
      const newState = { ...prev, [field]: value };
      const isSpecifyField = specifyQuestions[field];

      if (isSpecifyField) {
        let isSpecifySelected = false;
        if (Array.isArray(value)) {
          isSpecifySelected = value.some(item => item.includes('(Specify)'));
        } else if (typeof value === 'string') {
          isSpecifySelected = value.includes('(Specify)');
        }
        if (!isSpecifySelected) {
          newState[`${field}_specify`] = '';
        }
      }
      
      if (field === 'voterType' && value !== 'Party Member') {
        newState.partyName = '';
        newState.supportingParty = '';
      }
      
      return newState;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const phoneNumberPattern = /^[0-9]{10}$/;
      if (form.phoneNumber && !phoneNumberPattern.test(form.phoneNumber)) {
        setAlert({ open: true, type: "error", message: "Phone number must be exactly 10 digits." });
        return;
      }
      if (form.whatsappNumber && !phoneNumberPattern.test(form.whatsappNumber)) {
        setAlert({ open: true, type: "error", message: "WhatsApp number must be exactly 10 digits." });
        return;
      }
      if (!form.voterStatus) {
        setAlert({ open: true, type: "error", message: "Voter status is required. Please select one." });
        return;
      }
      const fileDataId = voter?.id;
      if (!fileDataId) {
        setAlert({ open: true, type: "error", message: "FileDataId is missing." });
        return;
      }

      const processPayload = (payload) => {
        Object.keys(specifyQuestions).forEach(field => {
          const specifyValue = payload[`${field}_specify`];
          const fieldValue = payload[field];

          if (fieldValue && specifyValue) {
            if (Array.isArray(fieldValue) && fieldValue.some(item => item.includes('(Specify)'))) {
              payload[field] = fieldValue
                .filter(item => !item.includes('(Specify)'))
                .concat(`Others: ${specifyValue}`);
            }
            else if (typeof fieldValue === 'string' && fieldValue.includes('(Specify)')) {
              payload[field] = `${fieldValue.replace(' (Specify)', '')}: ${specifyValue}`;
            }
          }
          delete payload[`${field}_specify`];
        });
        return payload;
      };
      
      const basePayload = {
        phoneNumber: form.phoneNumber,
        voter_type: form.voterType, // Correctly maps to backend's expected 'voter_type'
        partyName: form.partyName,
        supportingParty: form.supportingParty,
        booth: voter?.booth,
        constituency: voter?.assemblyConstituency,
        houseNumber: voter?.houseNumber,
        gender: voter?.gender,
        name: voter?.name,
        voterId: voter?.voterID,
        voterStatus: form.voterStatus,
        updated_by: user?.name,
        religion: form.religion,
        caste_specify: form.caste_specify,
        whatsappNumber: form.whatsappNumber,
        occupation: form.occupation,
        occupation_specify:form.occupation_specify,
        ques1: form.ques1,
        ques2: form.ques2,
        ques3: form.ques3,
        ques4: form.ques4,
        ques5: form.ques5,
        caste: form.caste,
        ques6: form.ques6,
        ques7: form.ques7,
        role: user?.role,
        surveyName: surveyName,
        userId: user?.id || null,
        created_by: user?.name,
        age: voter?.age,
        religion_specify: form.religion_specify,
        gender_specify: form.gender_specify,
        ques7_specify: form.ques7_specify,
        ques1_specify: form.ques1_specify,
        ques2_specify: form.ques2_specify,
        ques3_specify: form.ques3_specify,
      };

      if (isVerified) {
        const updatePayload = processPayload(basePayload);
        const updateUrl = `/survey/update-by-fileid?fileDataId=${voter.id}`;
        await axiosInstance.put(updateUrl, updatePayload);
        setAlert({ open: true, type: "success", message: "Survey updated successfully!" });
      } else {
        const submitPayload = processPayload({
          ...basePayload,
          fileDataId: voter?.id,
          verified: true,
        });
        await axiosInstance.post('/survey/submit', submitPayload);
        setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
      }

      await handleFetchVoterData();
      const basepath = user?.role === 'Surveyor' ? '/surveyor' : (user?.role === 'Admin' ? '/admin' : (user?.role === 'SuperAdmin' ? '/superadmin' : null));
      if (basepath) {
        setTimeout(() => navigate(`${basepath}/survey/with-voter-id`), 500);
      }
    } catch (e) {
      console.error("API Error:", e);
      let errorMessage = "Error processing the survey. Please try again.";
      if (e.response?.status === 409) {
        errorMessage = "This record was changed by someone else. Please refresh and try again.";
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      setAlert({ open: true, type: "error", message: errorMessage });
    }
  }, [voter, form, user, isVerified, surveyName, navigate, handleFetchVoterData, formFields]);

  const handleClear = useCallback(() => {
    setForm({
      ques1: "", ques1_specify: "",
      ques2: "", ques2_specify: "",
      ques3: "", ques3_specify: "",
      caste_specify: "",
      occupation:"",
      ques4: "", ques5: "", ques6: "",
      ques7: [],
      caste: "", religion: "",
      phoneNumber: "", whatsappNumber: "",
      voterStatus: "", voterType: "", 
      partyName: "",
      supportingParty: "",
      gender_specify: "",
      religion_specify: "",
      ques7_specify: "",
      occupation_specify:"",
    });
  }, []);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">Back</Button>
      <VoterDetails voter={voter} />
      <Grid container spacing={2}>
        {formFields.map(({ label, field, options, isInput, required }) => (
          <Fragment key={field}>
            <FormField
              label={label}
              field={field}
              options={options}
              isInput={isInput}
              required={required}
              value={form[field]}
              specifyValue={form[`${field}_specify`]}
              onChange={handleChange}
            />
            
            {field === 'voterType' && form.voterType === 'Party Member' && (
              <>
                {/* --- MODIFIED: This now renders Party Name as a Dropdown --- */}
                <Grid size={{xs:6}}>
                   <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
                    <CardContent>
                       <MemoizedSelect
                          label="Party Name"
                          field="partyName"
                          options={partyOptions}
                          value={form.partyName}
                          onChange={handleChange}
                        />
                    </CardContent>
                  </Card>
                </Grid>
                {/* --- MODIFIED: This now renders Supporting Party as a Dropdown --- */}
                <Grid size={{xs:6}}>
                   <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
                    <CardContent>
                       <MemoizedSelect
                          label="Supporting Party"
                          field="supportingParty"
                          options={partyOptions}
                          value={form.supportingParty}
                          onChange={handleChange}
                        />
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Fragment>
        ))}
      </Grid>
      <Box mt={3} display="flex" gap={2} justifyContent="center">
        <Button variant="contained" color={isVerified ? "warning" : "primary"} onClick={handleSubmit}>
          {isVerified ? "Update" : "Submit"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>Clear</Button>
      </Box>
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
        <Alert severity={alert.type} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}