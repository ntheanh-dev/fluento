import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Divider,
    Menu,
    MenuItem,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Quiz as QuizIcon,
    LibraryBooks as LibraryBooksIcon,
    Home as HomeIcon,
    School as SchoolIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { type NoteType, type CreateNoteTypeRequest, type CreateFieldRequest } from './vocabulary';
import { vocabularyNoteTypeApi } from './vocabularyApi';
import { notify } from '../../utils/notify';

const NoteTypeManagement: React.FC = () => {
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingNoteType, setEditingNoteType] = useState<NoteType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null);
    const [formData, setFormData] = useState<CreateNoteTypeRequest>({
        name: '',
        fields: [],
    });

    useEffect(() => {
        loadNoteTypes();
    }, []);

    const loadNoteTypes = async () => {
        try {
            setLoading(true);
            const noteTypesData = await vocabularyNoteTypeApi.getUserNoteTypes();
            setNoteTypes(noteTypesData);
        } catch (error) {
            notify('Lỗi khi tải danh sách note types', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (noteType?: NoteType) => {
        if (noteType) {
            setEditingNoteType(noteType);
            setFormData({
                name: noteType.name,
                fields: noteType.fields.map(field => ({
                    name: field.name,
                    fieldOrder: field.fieldOrder,
                    isRequired: field.isRequired,
                })),
            });
        } else {
            setEditingNoteType(null);
            setFormData({
                name: '',
                fields: [
                    { name: 'Front', fieldOrder: 0, isRequired: true },
                    { name: 'Back', fieldOrder: 1, isRequired: true },
                ],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNoteType(null);
        setFormData({
            name: '',
            fields: [],
        });
    };

    const handleAddField = () => {
        const newField: CreateFieldRequest = {
            name: '',
            fieldOrder: formData.fields.length,
            isRequired: false,
        };
        setFormData({
            ...formData,
            fields: [...formData.fields, newField],
        });
    };

    const handleRemoveField = (index: number) => {
        const newFields = formData.fields.filter((_, i) => i !== index);
        // Reorder fields
        newFields.forEach((field, i) => {
            field.fieldOrder = i;
        });
        setFormData({
            ...formData,
            fields: newFields,
        });
    };

    const handleFieldChange = (index: number, field: Partial<CreateFieldRequest>) => {
        const newFields = [...formData.fields];
        newFields[index] = { ...newFields[index], ...field };
        setFormData({
            ...formData,
            fields: newFields,
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingNoteType) {
                await vocabularyNoteTypeApi.updateNoteType(editingNoteType.id, formData);
                notify('Cập nhật note type thành công', 'success');
            } else {
                await vocabularyNoteTypeApi.createNoteType(formData);
                notify('Tạo note type thành công', 'success');
            }
            handleCloseDialog();
            loadNoteTypes();
        } catch (error) {
            notify('Lỗi khi lưu note type', 'error');
        }
    };

    const handleDelete = async (noteType: NoteType) => {
        if (window.confirm(`Bạn có chắc muốn xóa note type "${noteType.name}"?`)) {
            try {
                await vocabularyNoteTypeApi.deleteNoteType(noteType.id);
                notify('Xóa note type thành công', 'success');
                loadNoteTypes();
            } catch (error) {
                notify('Lỗi khi xóa note type', 'error');
            }
        }
        setAnchorEl(null);
        setSelectedNoteType(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, noteType: NoteType) => {
        setAnchorEl(event.currentTarget);
        setSelectedNoteType(noteType);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNoteType(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 2 }}
            >
                <Link
                    href="/"
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Trang chủ
                </Link>
                <Link
                    href="/vocabulary"
                    color="inherit"
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Luyện từ vựng
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <QuizIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Quản lý Note Types
                </Typography>
            </Breadcrumbs>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Quản lý Note Types
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2 }}
                >
                    Tạo Note Type Mới
                </Button>
            </Box>

            {noteTypes.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có note type nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Tạo note type đầu tiên để định nghĩa cấu trúc flashcard
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Tạo Note Type Đầu Tiên
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {noteTypes.map((noteType) => (
                        <Grid size={{ xs: 12, md: 6 }} key={noteType.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Typography variant="h6" component="h2">
                                            {noteType.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, noteType)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>


                                    <Box mb={2}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Fields:
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {noteType.fields.map((field) => (
                                                <Chip
                                                    key={field.id}
                                                    label={field.name}
                                                    size="small"
                                                    color={field.isRequired ? 'primary' : 'default'}
                                                    variant={field.isRequired ? 'filled' : 'outlined'}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Chip
                                            icon={<LibraryBooksIcon />}
                                            label={`${noteType.noteCount} notes`}
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(noteType.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingNoteType ? 'Chỉnh sửa Note Type' : 'Tạo Note Type Mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Tên note type"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />

                        <Box sx={{ mt: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Fields</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddField}
                                    size="small"
                                >
                                    Thêm Field
                                </Button>
                            </Box>

                            {formData.fields.map((field, index) => (
                                <Card key={index} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box display="flex" gap={2} alignItems="center">
                                            <TextField
                                                label="Tên field"
                                                value={field.name}
                                                onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                                                size="small"
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <TextField
                                                label="Thứ tự"
                                                type="number"
                                                value={field.fieldOrder}
                                                onChange={(e) => handleFieldChange(index, { fieldOrder: Number(e.target.value) })}
                                                size="small"
                                                sx={{ width: 100 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleRemoveField(index)}
                                                size="small"
                                                disabled={formData.fields.length <= 2}
                                            >
                                                Xóa
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}

                            {formData.fields.length < 2 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Note type cần ít nhất 2 fields để tạo flashcard.
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={formData.fields.length < 2 || !formData.name.trim()}
                    >
                        {editingNoteType ? 'Cập nhật' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenDialog(selectedNoteType!);
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Chỉnh sửa
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedNoteType!)}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Xóa
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default NoteTypeManagement;
