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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from "@mui/material";
import {
    CloudUpload,
    Delete,
    InsertDriveFile,
    // Image,
    // PictureAsPdf,
    Description,
    FolderOpen
} from "@mui/icons-material";
import { useState, useRef } from "react";

export default function FileUpload({ maxFiles, maxFileSize, onFilesChange, apiEndpoint }) {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [showSurveyDialog, setShowSurveyDialog] = useState(false);
    const [surveyName, setSurveyName] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [surveyNameError, setSurveyNameError] = useState('');
    const fileInputRef = useRef(null);

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

    const submitFilesToBackend = async (validFiles, surveyName) => {
        try {
            setUploading(true);
            
            console.log('Survey Name:', surveyName);
            console.log('Files to upload:', validFiles.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            })));
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setFiles(currentFiles => 
                currentFiles.map(f => {
                    const matchingFile = validFiles.find(vf => vf.id === f.id);
                    return matchingFile ? { ...f, progress: 100, uploaded: true, surveyName } : f;
                })
            );
            
            /*
            // Backend integration code (commented out for now)
            for (const fileData of validFiles) {
                const formData = new FormData();
                formData.append('file', fileData.file);
                formData.append('surveyName', surveyName);
                
                const response = await fetch(apiEndpoint || '/api/upload-survey', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to upload ${fileData.name}`);
                }
                
                // Update progress for this file
                setFiles(currentFiles => 
                    currentFiles.map(f => 
                        f.id === fileData.id ? { ...f, progress: 100, uploaded: true, surveyName } : f
                    )
                );
            }
            */
            
            return true;
        } catch (error) {
            console.error('Upload error:', error);
            setError(`Upload failed: ${error.message}`);
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleSurveyNameSubmit = async () => {
        setSurveyNameError('');
        
        if (!surveyName.trim()) {
            setSurveyNameError('Survey name is required');
            return;
        }
        
        if (surveyName.trim().length < 3) {
            setSurveyNameError('Survey name must be at least 3 characters');
            return;
        }

        const validFiles = pendingFiles.map(file => ({
            ...file,
            progress: 0,
            surveyName: surveyName.trim()
        }));

        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        
        if (onFilesChange) {
            onFilesChange(updatedFiles);
        }

        setShowSurveyDialog(false);
        setSurveyName('');
        setPendingFiles([]);

        await submitFilesToBackend(validFiles, surveyName.trim());
    };

    const handleFiles = (newFiles) => {
        setError('');
        const fileList = Array.from(newFiles);
        
        if (files.length + fileList.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed. You're trying to add ${fileList.length} more files.`);
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
                    uploaded: false
                });
            }
        });

        if (errors.length > 0) {
            setError(errors.join(' '));
        }

        if (validFiles.length > 0) {
            setPendingFiles(validFiles);
            setShowSurveyDialog(true);
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
        if (onFilesChange) {
            onFilesChange(updatedFiles);
        }
    };

    const clearAllFiles = () => {
        setFiles([]);
        setError('');
        if (onFilesChange) {
            onFilesChange([]);
        }
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
                
                <Stack spacing={1.2} sx={{ maxHeight: { xs: 200, lg: 240 }, overflowY: 'auto', pr: 1 }}>
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
                                        {file.surveyName && ` • Survey: ${file.surveyName}`}
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
        <Box sx={{ width: { xs: "100%", md: "98%" } }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
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
                            disabled={uploading}
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

                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ 
                        height: { xs: 'auto', lg: '100%' },
                        minHeight: { xs: 150, lg: 250 }
                    }}>
                        <FilesList />
                    </Box>
                </Grid>
            </Grid>

            <Dialog 
                open={showSurveyDialog} 
                onClose={() => {
                    setShowSurveyDialog(false);
                    setSurveyName('');
                    setSurveyNameError('');
                    setPendingFiles([]);
                }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'rgba(0, 0, 0, 0.8)'
                }}>
                    Survey Name Required
                </DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0, 0, 0, 0.6)' }}>
                        Please provide a name for this survey. The uploaded files will be associated with this survey name.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Survey Name"
                        variant="outlined"
                        value={surveyName}
                        onChange={(e) => {
                            setSurveyName(e.target.value);
                            setSurveyNameError('');
                        }}
                        error={!!surveyNameError}
                        helperText={surveyNameError}
                        placeholder="Enter survey name..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.2)'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.4)'
                                }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => {
                            setShowSurveyDialog(false);
                            setSurveyName('');
                            setSurveyNameError('');
                            setPendingFiles([]);
                        }}
                        sx={{ 
                            textTransform: 'none',
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&:hover': {
                                background: 'rgba(0, 0, 0, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSurveyNameSubmit}
                        variant="contained"
                        disabled={uploading}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 1.5,
                            px: 3,
                            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1976D2, #1565C0)'
                            }
                        }}
                    >
                        {uploading ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Uploading...
                            </>
                        ) : (
                            'Upload Files'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}