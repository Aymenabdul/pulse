import { useCallback, useState, useEffect, useMemo, memo, Fragment } from "react";
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
  Checkbox,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams  } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

// --- Constants ---
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
    "Wayalpad or Nawalpeta Korachas", "Wynad Chetty", "Yadhava", "Yavana", "Yerukula", "Yogeeswarar","Others (Specify)",
];

const partyOptions = [
    "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", 
    "CPI", "CPM", "PMK", "DMDK", "MNM", "Others",
];

const specifyQuestions = { ques1: true, ques2: true, ques3: true, ques7: true, religion: true, gender: true, caste: true, occupation: true };

const processSpecifyFields = (payload) => {
  const processedPayload = { ...payload };
  for (const field in specifyQuestions) {
    const specifyValue = processedPayload[`${field}_specify`];
    const fieldValue = processedPayload[field];

    if (fieldValue && specifyValue) {
      if (Array.isArray(fieldValue) && fieldValue.some(item => item.includes('(Specify)'))) {
        processedPayload[field] = fieldValue
          .filter(item => !item.includes('(Specify)'))
          .concat(`Others: ${specifyValue}`);
      } else if (typeof fieldValue === 'string' && fieldValue.includes('(Specify)')) {
        processedPayload[field] = `${fieldValue.replace(' (Specify)', '')}: ${specifyValue}`;
      }
    }
    delete processedPayload[`${field}_specify`];
  }
  return processedPayload;
};

const MemoizedTextField = memo(({ label, field, value, onChange, type = "text" }) => {
  const handleInputChange = (e) => {
    let inputValue = e.target.value;
    const fieldName = field.toLowerCase();

    if (fieldName.includes('number')) {
      inputValue = inputValue.replace(/[^0-9]/g, '').slice(0, 10);
    }
    else if (fieldName === 'name') {
      inputValue = inputValue.replace(/[^A-Za-z ]/g, '');
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

const MemoizedSelect = memo(({ label, field, options, value, onChange, isSpecifyQuestion, specifyValue }) => {
  const requiresSpecify = isSpecifyQuestion && typeof value === 'string' && value.includes('(Specify)');
  return (
    <div>
      <Typography fontWeight={600} mb={1}>{label}</Typography>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={(e) => onChange(field, e.target.value)}>
          <MenuItem value=""><em>None</em></MenuItem>
          {options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
      {requiresSpecify && (
        <MemoizedTextField label="Please Specify" field={`${field}_specify`} value={specifyValue} onChange={onChange} />
      )}
    </div>
  );
});
MemoizedSelect.displayName = 'MemoizedSelect';

const MemoizedRadioGroup = memo(({ label, field, options, value, onChange }) => (
    <div>
      <Typography fontWeight={600} mb={1}>{label}</Typography>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={value} onChange={(e) => onChange(field, e.target.value)}>
          <Grid container spacing={1}>
            {options.map((option) => (
              <Grid size={{xs:6,sm:6, md:3}} key={option}>
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
    const newSelected = value.includes(option) ? value.filter(item => item !== option) : [...value, option];
    onChange(field, newSelected);
  };
  return (
    <div>
      <Typography fontWeight={600} mb={1}>{label}</Typography>
      <FormControl component="fieldset" fullWidth>
        <Grid container spacing={1}>
          {options.map((option) => (
            <Grid size={{xs:6,sm:6, md:3}} key={option}>
              <FormControlLabel control={<Checkbox checked={value.includes(option)} onChange={() => handleToggle(option)} />} label={option} />
            </Grid>
          ))}
        </Grid>
      </FormControl>
    </div>
  );
});
MemoizedMultiSelectRadio.displayName = 'MemoizedMultiSelectRadio';

const FormField = memo(({ label, field, options, isInput, value, onChange, specifyValue }) => {
  const isSpecifyQuestion = specifyQuestions[field];

  const requiresSpecify = useMemo(() => {
    if (!isSpecifyQuestion || !value) return false;
    if (Array.isArray(value)) {
      return value.some(item => typeof item === 'string' && item.includes('(Specify)'));
    }
    return typeof value === 'string' && value.includes('(Specify)');
  }, [isSpecifyQuestion, value]);

  const renderField = () => {
    if (isInput) {
      return <MemoizedTextField label={label} field={field} value={value} onChange={onChange} type={field.toLowerCase().includes('number') ? 'tel' : 'text'} />;
    }
    // --- MODIFIED: Specific check for 'caste' to render as a dropdown ---
    if (field === "caste") { 
      return <MemoizedSelect label={label} field={field} options={options} value={value} onChange={onChange} isSpecifyQuestion={isSpecifyQuestion} specifyValue={specifyValue} />
    }
    if (field === "ques7") { 
      return (
        <div>
          <MemoizedMultiSelectRadio label={label} field={field} options={options} value={value} onChange={onChange} />
          {requiresSpecify && <MemoizedTextField label="Please Specify" field={`${field}_specify`} value={specifyValue} onChange={onChange} />}
        </div>
      );
    }
    // --- MODIFIED: Default to Radio Group for all other non-input fields ---
    return (
      <div>
        <MemoizedRadioGroup label={label} field={field} options={options} value={value} onChange={onChange} />
        {requiresSpecify && <MemoizedTextField label="Please Specify" field={`${field}_specify`} value={specifyValue} onChange={onChange} />}
      </div>
    );
  };

  return (
    <Grid size={{xs:12}}>
      <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
        <CardContent>{renderField()}</CardContent>
      </Card>
    </Grid>
  );
});
FormField.displayName = 'FormField';

export default function SurveyWithoutVoterId() {
  const from = location.pathname.split('/')[1];
  console.log('SurveyWithoutVoterId rendered with from:', from);
  const [existingSurvey, setExistingSurvey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [selectedSurveyName, setSelectedSurveyName] = useState("");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [constituencyOptions, setConstituencyOptions] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "", age: "", gender: "", gender_specify: "", houseNumber: "", phoneNumber: "", whatsappNumber: "", religion: "", religion_specify: "", caste: "", caste_specify: "",
    district: "", constituency: "",
    // --- ADDED: voterType and party fields to state ---
    voterType: "", partyName: "", supportingParty: "",
    ques1: "", ques1_specify: "", ques2: "", ques2_specify: "", ques3: "", ques3_specify: "",
    ques4: "", ques5: "", ques6: "",
    ques7: [], ques7_specify: "",occupation:"",occupation_specify:"",
  });

  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });
  const idFromParams = searchParams.get('id');

  const formFields = useMemo(() => [
    { label: "Full Name", field: "name", isInput: true },
    { label: "Voter Type", field: "voterType", options: ["Public", "Party Member"] },
    { label: "Occupation / Employment Status", field: "occupation", options: ["Student", "Homemaker", "Unemployed", "Self-employed","Farmer","Daily wage laborer","Private sector employee","Government employee","Professional","Retired", "Others (Specify)"] },
    { label: "Religion", field: "religion", options: ["Hindu", "Muslim", "Christian", "Others (Specify)"] },
    { label: "Caste", field: "caste", options: casteOptions },
    { label: "Age Range", field: "age", options: ["18-30", "31-40", "41-50", "Above 50"] },
    { label: "Gender", field: "gender", options: ["Male", "Female", "Others (Specify)"] },
    { label: "Phone Number", field: "phoneNumber", isInput: true },
    { label: "WhatsApp Number", field: "whatsappNumber", isInput: true },
    { label: "Who did you vote for in 2016?", field: "ques1", options: [ "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", 
    "CPI", "CPM", "PMK", "DMDK", "MNM","Muslim Parties (Specify)"," Independent (Specify)","NOTA", "Others (Specify)"] },
    { label: "Who did you vote for in 2021?", field: "ques2",options: [ "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", 
    "CPI", "CPM", "PMK", "DMDK", "MNM","Muslim Parties (Specify)"," Independent (Specify)","NOTA", "Others (Specify)"] },
    { label: "Who will you vote for in 2026?", field: "ques3", options: [ "AIADMK", "DMK", "BJP", "INC", "NTK", "TVK", "VCK", "MDMK", 
    "CPI", "CPM", "PMK", "DMDK", "MNM","Muslim Parties (Specify)"," Independent (Specify)","NOTA", "Others (Specify)"] },
    { label: "Performance of CM Edappadi K. Palaniswami (2017–2021)?", field: "ques4", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Performance of CM Stalin (2021–2026)?", field: "ques5", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Performance of your current MLA?", field: "ques6", options: ["Bad", "Average", "Good", "Very good"] },
    { label: "Important issues in this constituency?", field: "ques7", options: ["Traffic", "Poor Roads", "Flood", "Drainage", "Waterlogging", " No Flyover", "NEET", "Mosquitos", "Garbage", "Water supply", "Crop harvest disruption", "Pollution", "Public health crisis", "Women safety", "Unemployment", "Bus Services", "Train services", "Land grabbing", "No Electricity", "Inflation", "Caste conflict", "Others (Specify)"] },
  ], []);

  
  useEffect(() => {
    axiosInstance.get('/getdist')
      .then((response) => setDistrictOptions(response.data))
      .catch((error) => console.error('Error fetching districts!', error));
  }, []);
  
  useEffect(() => {
    if (form.district) {
      axiosInstance.get(`/distconst?districtName=${encodeURIComponent(form.district)}`)
        .then((response) => setConstituencyOptions(response.data))
        .catch((error) => {
          console.error(`Error fetching constituencies for ${form.district}:`, error);
          setConstituencyOptions([]);
        });
    } else {
      setConstituencyOptions([]);
    }
  }, [form.district]);

  const fetchExistingSurvey = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/survey/survey-by-id?id=${id}`);
      if (response.data) {
        setExistingSurvey(response.data);
        setIsEditing(true);
        const fetchedData = response.data;
        
        // --- MODIFIED: Fix for voterType loading ---
        const newFormState = { 
            ...form, 
            ...fetchedData,
            voterType: fetchedData.voter_type || fetchedData.voterType || '',
            ques7: fetchedData.ques7 || [] 
        };

        Object.keys(specifyQuestions).forEach(field => {
          const value = fetchedData[field];
          if (Array.isArray(value)) {
            const specifyAnswer = value.find(item => item.includes(': '));
            const otherAnswers = value.filter(item => !item.includes(': '));
            if (specifyAnswer) {
              const specifyText = specifyAnswer.split(': ')[1];
              const specifyPlaceholder = formFields.find(f => f.field === field)?.options.find(opt => opt.includes('(Specify)'));
              newFormState[field] = [...otherAnswers, specifyPlaceholder];
              newFormState[`${field}_specify`] = specifyText;
            } else {
              newFormState[field] = value;
            }
          } else if (typeof value === 'string' && value.includes(': ')) {
            const parts = value.split(': ');
            const optionPart = parts[0].trim();
            const specifyPart = parts.slice(1).join(': ').trim();
            const matchingOption = formFields.find(f => f.field === field)?.options.find(opt => opt.startsWith(optionPart));
            if (matchingOption) {
              newFormState[field] = matchingOption;
              newFormState[`${field}_specify`] = specifyPart;
            }
          } else {
            newFormState[field] = value || (Array.isArray(form[field]) ? [] : '');
          }
        });
        setForm(newFormState);
        if (fetchedData.surveyName) setSelectedSurveyName(fetchedData.surveyName);
      }
    } catch (error) {
      console.error("Error loading existing survey data.", error);
    }
  }, [ formFields]);
  
  useEffect(() => {
    axiosInstance.get('/survey/active')
      .then((response) => setActiveSurveys(response.data))
      .catch((error) => console.error("Error loading active surveys.", error));
  }, []);

  useEffect(() => {
    if (idFromParams) {
      fetchExistingSurvey(idFromParams);
    }
  }, [idFromParams, fetchExistingSurvey]);
  
  const handleChange = useCallback((field, value) => {
    setForm((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === 'district') newState.constituency = '';

      if (specifyQuestions[field]) {
        const isSpecifySelected = Array.isArray(value)
          ? value.some(item => item.includes('(Specify)'))
          : typeof value === 'string' && value.includes('(Specify)');
        if (!isSpecifySelected) newState[`${field}_specify`] = '';
      }
      
      // --- ADDED: Clear party fields if voterType is not 'Party Member' ---
      if (field === 'voterType' && value !== 'Party Member') {
        newState.partyName = '';
        newState.supportingParty = '';
      }

      return newState;
    });
  }, []);
  
  const handleSubmit = useCallback(async () => {
    if (!selectedSurveyName) {
      setAlert({ open: true, type: "error", message: "Please select a survey first." });
      return;
    }
    try {
        const basePayload = { 
            ...form, 
            surveyName: selectedSurveyName, 
            userId: user?.id, 
            role: user?.role,
            // --- ADDED: Map voterType to voter_type for backend ---
            voter_type: form.voterType
        };
        // We delete the frontend-specific 'voterType' key before sending
        delete basePayload.voterType;

      if (isEditing && existingSurvey?.id) {
        const updatePayload = processSpecifyFields({ ...basePayload, id: existingSurvey.id, updated_by: user?.name });
        const updateUrl = `/survey/update-by-id?surveyName=${selectedSurveyName}&id=${existingSurvey.id}`;
        await axiosInstance.put(updateUrl, updatePayload);
        setAlert({ open: true, type: "success", message: "Survey updated successfully!" });
      } else {
        const submitPayload = processSpecifyFields({ ...basePayload, created_by: user?.name, verified: true, voted: false });
        await axiosInstance.post('/survey/submit', submitPayload);
        setAlert({ open: true, type: "success", message: "Survey submitted successfully!" });
      }
      setTimeout(() => navigate(-1), 2000);
    } catch (e) {
      const errorMessage = e.response?.data?.message || (isEditing ? "Error updating survey." : "Error submitting survey.");
      setAlert({ open: true, type: "error", message: errorMessage });
    }
  }, [form, user, selectedSurveyName, isEditing, existingSurvey, navigate]);

  const handleClear = useCallback(() => {
    setForm({
      name: "", age: "", gender: "", gender_specify: "", houseNumber: "", phoneNumber: "", whatsappNumber: "", religion: "", religion_specify: "", caste: "", caste_specify: "",
      district: "", constituency: "",
      // --- ADDED: Clear party fields ---
      voterType: "", partyName: "", supportingParty: "",
      ques1: "", ques1_specify: "", ques2: "", ques2_specify: "", ques3: "", ques3_specify: "",
      ques4: "", ques5: "", ques6: "",
      ques7: [], ques7_specify: "",occupation:"",occupation_specify:"",
    });
  }, []);

  // const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleStartSurvey = (type) => {
    console.log('Starting survey of type:', from);
    
    if (type === 'with-voter-id') {
      navigate(`/${from}/survey/with-voter-id`);
    } else if (type === 'without-voter-id') {
      navigate(`/${from}/survey/without-voter-id`);
    }
  };

  return (
    <Box p={2} maxWidth="md" mx="auto">
      {/* <Button onClick={handleBack} sx={{ mb: 2 }} variant="outlined">Back</Button> */}
      <Button onClick={() => handleStartSurvey('without-voter-id')} sx={{ mb: 2,marginLeft:'1%'}}  variant="outlined">Edit Survey</Button>
      <Typography variant="h4" align="center" style={{textTransform: 'uppercase',fontWeight:'700'}} gutterBottom>General Survey</Typography>

      <Grid container spacing={2} mb={2}>
        <Grid size={{xs:12}}>
            <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                    <FormControl fullWidth>
                        <InputLabel>Select Survey</InputLabel>
                        <Select value={selectedSurveyName} label="Select Survey" onChange={(e) => setSelectedSurveyName(e.target.value)}>
                            <MenuItem value=""><em>Choose a survey</em></MenuItem>
                            {activeSurveys?.map((survey) => <MenuItem key={survey} value={survey}>{survey}</MenuItem>)}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>
        </Grid>
        <Grid size={{xs:12}}>
            <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                    <FormControl fullWidth>
                        <InputLabel>Select District</InputLabel>
                        <Select name="district" value={form.district} label="Select District" onChange={(e) => handleChange('district', e.target.value)}>
                            <MenuItem value=""><em>Choose a district</em></MenuItem>
                            {districtOptions?.map((dist) => <MenuItem key={dist} value={dist}>{dist}</MenuItem>)}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>
        </Grid>
        <Grid size={{xs:12}}>
            <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                    <FormControl fullWidth>
                        <InputLabel>Select Constituency</InputLabel>
                        <Select name="constituency" value={form.constituency} label="Select Constituency" onChange={(e) => handleChange('constituency', e.target.value)} disabled={!form.district}>
                            <MenuItem value=""><em>Choose a constituency</em></MenuItem>
                            {constituencyOptions?.map((con) => <MenuItem key={con} value={con}>{con}</MenuItem>)}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
      
      {isEditing && <Alert severity="info" sx={{ mb: 3 }}>You are editing a previously submitted survey.</Alert>}

      <Grid container spacing={2}>
        {formFields.map(({ label, field, options, isInput }) => (
          <Fragment key={field}>
            <FormField
              key={field}
              label={label}
              field={field}
              options={options}
              isInput={isInput}
              value={form[field]}
              onChange={handleChange}
              specifyValue={form[`${field}_specify`]}
            />
            {/* --- MODIFIED: Conditional rendering logic for party dropdowns --- */}
            {field === 'voterType' && form.voterType === 'Party Member' && (
              <>
                <Grid size={{xs:12}}>
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
                <Grid size={{xs:12}}>
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
        <Button variant="contained" color={isEditing ? "warning" : "primary"} onClick={handleSubmit}>
          {isEditing ? "Update" : "Submit"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>Clear</Button>
      </Box>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert(p => ({ ...p, open: false }))}>
        <Alert severity={alert.type} onClose={() => setAlert(p => ({ ...p, open: false }))}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}