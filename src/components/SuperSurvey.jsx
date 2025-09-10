import {
    Box,
    Typography,
    Button,
    IconButton,
    LinearProgress,
    Chip,
    Paper,
    Stack,
    Alert,
    Grid,
    CircularProgress,
    Snackbar
} from "@mui/material";
import {
    CloudUpload,
    Delete,
    InsertDriveFile,
    Description,
    FolderOpen
} from "@mui/icons-material";
import { useState, useRef } from "react";
import axiosInstance from "../axios/axios";
import CreatePopup from "../pages/superadmin/createpopup";

export default function SuperSurvey({ onUploadSuccess }) {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);
const [isSurveyPopupOpen, setIsSurveyPopupOpen] = useState(false);
    const maxFiles = 10;
    const maxFileSize = 50 * 1024 * 1024;
    const acceptedTypes = ['.xlsx', '.xls', '.csv'];

    const getFileIcon = (fileName) => {
        const extension = fileName.toLowerCase().split('.').pop();

        switch (extension) {
            case 'xlsx':
            case 'xls':
            case 'csv':
                return <Description sx={{ color: '#2196F3', fontSize: 18 }} />;
            default:
                return <InsertDriveFile sx={{ color: '#9E9E9E', fontSize: 18 }} />;
        }
    };

    const handleOpenSurveyPopup = () => {
        setIsSurveyPopupOpen(true);
    };

    const handleCloseSurveyPopup = () => {
        setIsSurveyPopupOpen(false);
    };

    const handleSurveySubmit = async (surveyData) => {
        console.log('Attempting to submit survey data:', surveyData);
        try {
            const response = await axiosInstance.post('/survey/survSubmit', surveyData);
            console.log('Survey submission successful:', response.data);
            showSnackbar('Survey created successfully!', 'success');
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create survey.';
            showSnackbar(`Error: ${errorMessage}`, 'error');
        } finally {
            handleCloseSurveyPopup();
        }
    };


    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        if (file.size > maxFileSize) {
            return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`;
        }

        const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
        if (!acceptedTypes.includes(fileExtension)) {
            return `File type "${fileExtension}" is not supported.`;
        }

        return null;
    };

    const submitFilesToBackend = async () => {
        if (!files.length) {
            showSnackbar('No files selected for upload.', 'warning');
            return false;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            // Append all files
            files.forEach((fileData) => {
                formData.append('file', fileData.file); // use same key for array
            });

            const response = await axiosInstance.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (onUploadSuccess) onUploadSuccess();
            const backendMessage = response.data || 'Files uploaded successfully!';

            showSnackbar(backendMessage, 'success');

            // Mark all as uploaded and clear
            setFiles(currentFiles =>
                currentFiles.map(f => ({ ...f, progress: 100, uploaded: true }))
            );

            setTimeout(() => {
                setFiles([]);
                setError('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                showSnackbar('Files cleared after successful upload', 'info');
            }, 1000);

            return true;
        } catch (error) {
            const errorMessage = error.response?.data || error.message || 'Upload failed';
            showSnackbar(`Upload failed: ${errorMessage}`, 'error');
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleFiles = (newFiles) => {
        setError('');
        const fileList = Array.from(newFiles);

        if (files.length + fileList.length > maxFiles) {
            const errorMsg = `Maximum ${maxFiles} files allowed.`;
            setError(errorMsg);
            showSnackbar(errorMsg, 'warning');
            return;
        }

        const validFiles = [];
        const errors = [];

        fileList.forEach(file => {
            if (files.some(existingFile => existingFile.name === file.name)) {
                errors.push(`File "${file.name}" is already selected.`);
                return;
            }

            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push({
                    file,
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    progress: 0,
                    uploaded: false,
                });
            }
        });

        if (errors.length > 0) {
            const errorMessage = errors.join(' ');
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        }

        if (validFiles.length > 0) {
            setFiles(currentFiles => [...currentFiles, ...validFiles]);
            showSnackbar(`${validFiles.length} file(s) added successfully`, 'info');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId) => {
        const updatedFiles = files.filter(file => file.id !== fileId);
        setFiles(updatedFiles);
    };

    const clearAllFiles = () => {
        setFiles([]);
        setError('');
        showSnackbar('All files cleared', 'info');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const FilesList = () => (
        files.length > 0 ? (
            <Box sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.1rem', fontWeight: 600 }}>
                        Selected Files ({files.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={submitFilesToBackend}
                            disabled={uploading || files.length === 0}
                            variant="contained"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                px: 2,
                                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #45a049, #3d8b40)'
                                }
                            }}
                        >
                            {uploading ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}
                            Upload All
                        </Button>
                        <Button
                            onClick={clearAllFiles}
                            size="small"
                            sx={{
                                color: 'rgba(244, 67, 54, 0.8)',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                minWidth: 'auto',
                                px: 1.5,
                                '&:hover': {
                                    background: 'rgba(244, 67, 54, 0.1)'
                                }
                            }}
                        >
                            Clear All
                        </Button>
                    </Box>
                </Box>

                <Stack spacing={1.2} sx={{ maxHeight: { xs: 200, lg: 240 }, overflowY: 'scroll', pr: 1 }}>
                    {files.map((file) => (
                        <Paper
                            key={file.id}
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 1)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {getFileIcon(file.name)}

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'rgba(0, 0, 0, 0.85)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>
                                        {formatFileSize(file.size)}
                                    </Typography>

                                    <LinearProgress
                                        variant="determinate"
                                        value={file.progress}
                                        sx={{
                                            mt: 0.8,
                                            height: 3,
                                            borderRadius: 1.5,
                                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                background: file.uploaded
                                                    ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                                                    : 'linear-gradient(135deg, #2196F3, #1976D2)',
                                                borderRadius: 1.5
                                            }
                                        }}
                                    />
                                </Box>

                                <IconButton
                                    onClick={() => removeFile(file.id)}
                                    size="small"
                                    sx={{
                                        color: 'rgba(244, 67, 54, 0.8)',
                                        p: 0.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(244, 67, 54, 0.15)'
                                        }
                                    }}
                                    disabled={uploading}
                                >
                                    <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            </Box>
        ) : (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: { xs: 150, lg: 200 },
                    border: '2px dashed rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center'
                }}
            >
                <FolderOpen sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.5)', mb: 0.5, fontWeight: 500 }}>
                    No files selected
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                    Selected files will appear here
                </Typography>
            </Box>
        )
    );

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box 
                sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mb: 2,
                    marginLeft:"-1%",
                }}
            >
                <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleOpenSurveyPopup}
                    sx={{ borderRadius: 2 }}
                >
                    Create Survey
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <CreatePopup // Assuming CreatePopup is your SurveyCreationPopup component
                open={isSurveyPopupOpen}
                onClose={handleCloseSurveyPopup}
                onSubmit={handleSurveySubmit}
            />
        </Box>



    );
};