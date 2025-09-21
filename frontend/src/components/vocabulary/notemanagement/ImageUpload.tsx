import React from 'react';
import {
    Box,
    Card,
    Button,
    Avatar,
    Paper,
    Typography
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { notify } from '../../../utils/notify';

interface ImageUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    imageUrl?: string; // For editing existing images
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove, imageUrl }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if it's an image file
            const isImage = file.type && file.type.startsWith('image/') ||
                file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);

            if (!isImage) {
                notify('Please select an image file (JPG, PNG, GIF, WebP, etc.)', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                notify('File size must be less than 10MB', 'error');
                return;
            }
            onChange(file);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    return (
        <Box>
            {(value || imageUrl) ? (
                <Card sx={{ maxWidth: 300, margin: '8px 0' }}>
                    <Avatar
                        src={value ? URL.createObjectURL(value) : imageUrl}
                        alt="Preview"
                        sx={{ width: 200, height: 200, margin: 'auto', mt: 2 }}
                    />
                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onRemove}
                        >
                            Remove
                        </Button>
                        <Button
                            size="small"
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleClick}
                        >
                            Change
                        </Button>
                    </Box>
                </Card>
            ) : (
                <Paper
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        backgroundColor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover'
                        }
                    }}
                    onClick={handleClick}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Click to upload image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Supports: JPG, PNG, GIF, WebP (Max 10MB)
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={handleClick}
                    >
                        Select Image File
                    </Button>
                </Paper>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </Box>
    );
};

export default ImageUpload;
