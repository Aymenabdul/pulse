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

export default function FileUpload({ onUploadSuccess }) {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);
    const [isSurveyPopupOpen, setIsSurveyPopupOpen] = useState(false);
    const maxFiles = 10;
    const maxFileSize = 50 * 1024 * 1024;
    const acceptedTypes = ['.xlsx', '.xls'];

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
            files.forEach((fileData) => {
                formData.append('file', fileData.file);
            });

            // Send the files to the backend
            const response = await axiosInstance.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Extract message and data from the response
            const { message, data } = response.data;
            const successfulUploads = data.successfulUploads || [];
            const failedUploads = data.failedUploads || [];

            // Display the general message from the response
            if (message) {
                showSnackbar(message, 'info');
            }

            // Display success message for uploaded files
            if (successfulUploads.length > 0) {
                const successMessage = `Successfully uploaded: ${successfulUploads.join(', ')}`;
                showSnackbar(successMessage, 'success');
            }

            // Display error message for failed uploads
            if (failedUploads.length > 0) {
                const errorMessages = failedUploads
                    .map(file => `${file.fileName}: ${file.error}`)
                    .join(', ');
                showSnackbar(`Failed to upload: ${errorMessages}`, 'error');
            }

            // Update the files list
            setFiles((currentFiles) => {
                // Remove successfully uploaded files
                const updatedFiles = currentFiles.filter(f => !successfulUploads.includes(f.file.name));

                // Keep failed files for retrying (do not remove them)
                const failedFileNames = failedUploads.map(f => f.fileName);
                const remainingFailedFiles = currentFiles.filter(f => failedFileNames.includes(f.file.name));

                // Combine both: failed files stay and successful ones are removed
                return [...remainingFailedFiles];
            });

            // If all files were successful, reset the files list to empty
            if (successfulUploads.length === files.length) {
                setFiles([]);
            }

            // If there is an onUploadSuccess callback, trigger it
            if (onUploadSuccess) onUploadSuccess();

            // Reset the file input to allow the user to select new files again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return true;

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
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

            const validationError = validateFile(file); // Your file validation logic
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
            <Typography
                variant="h5"
                
                gutterBottom
                sx={{ fontWeight: 'bold', textAlign: 'left', mb: 3,textTransform: 'uppercase' }}
            >
                Voters List File Upload
            </Typography>
            {/* <Box 
                sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mb: 2,
                    marginLeft:"-1%",
                }}
            >
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenSurveyPopup}
                    sx={{ borderRadius: 2 }}
                >
                    Create Survey
                </Button>
            </Box> */}
            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}} alignItems="stretch" width={"100%"}>
                {/* File Upload Section */}
                <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '49%' } }}>
                    <Paper
                        sx={{
                            border: dragActive ? '2px dashed rgba(255, 255, 255, 0.8)' : '2px dashed rgba(255, 255, 255, 0.5)',
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: dragActive
                                ? 'rgba(255, 255, 255, 0.4)'
                                : 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(15px)',
                            boxShadow: dragActive
                                ? '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                                : '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                            minHeight: { xs: 150, lg: 250 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.35)',
                                borderColor: 'rgba(255, 255, 255, 0.7)',
                                boxShadow: '0 6px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                            }
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleChange}
                            accept={acceptedTypes.join(',')}
                            style={{ display: 'none' }}
                            disabled={uploading || files.length >= maxFiles}
                        />
                        <CloudUpload
                            sx={{
                                fontSize: 28,
                                color: dragActive ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                mb: 1,
                                transition: 'color 0.3s ease'
                            }}
                        />
                        <Typography variant="h6" sx={{ mb: 0.3, color: 'rgba(0, 0, 0, 0.85)', fontSize: '0.95rem', fontWeight: 600 }}>
                            {dragActive ? 'Drop files here' : 'Drag & drop files'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1.2, fontSize: '0.75rem' }}>
                            or click to browse
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                            disabled={uploading || files.length >= maxFiles}
                            sx={{
                                background: 'rgba(0, 0, 0, 0.1)',
                                color: 'rgba(0, 0, 0, 0.8)',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 2.5,
                                py: 0.6,
                                borderRadius: 1.5,
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(5px)',
                                fontSize: '0.8rem',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    background: 'rgba(0, 0, 0, 0.15)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                                },
                                '&:disabled': {
                                    background: 'rgba(0, 0, 0, 0.05)',
                                    color: 'rgba(0, 0, 0, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {uploading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                            Choose Files
                        </Button>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.7rem' }}>
                            Max {maxFiles} files • {formatFileSize(maxFileSize)} each
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.6, justifyContent: 'center', flexWrap: 'wrap', gap: 0.4 }}>
                            {acceptedTypes.map((type) => (
                                <Chip
                                    key={type}
                                    label={type}
                                    size="small"
                                    sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        background: 'rgba(0, 0, 0, 0.08)',
                                        color: 'rgba(0, 0, 0, 0.7)',
                                        border: '1px solid rgba(0, 0, 0, 0.15)',
                                        '& .MuiChip-label': {
                                            px: 0.8
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError('')}
                            sx={{
                                mt: 2,
                                borderRadius: 1.5,
                                background: 'rgba(244, 67, 54, 0.1)',
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                color: 'rgba(244, 67, 54, 0.9)',
                                '& .MuiAlert-icon': {
                                    color: 'rgba(244, 67, 54, 0.8)'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                </Grid>

                {/* Survey Table */}
                <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '49%' } }}>
                    <Box sx={{ height: '100%', minHeight: 150 }}>
                        <FilesList />
                    </Box>
                </Grid>
            </Grid>

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