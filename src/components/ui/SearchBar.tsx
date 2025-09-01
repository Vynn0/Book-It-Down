import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, CalendarToday, AccessTime } from '@mui/icons-material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { setMinutes, setHours, isAfter, isBefore, format } from 'date-fns';

interface SearchBarProps {
  onSearch: (query: {
    tanggal: Date | null;
    kapasitas: number;
    jamMulai: Date | null;
    jamSelesai: Date | null;
  }) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [selectedTanggal, setSelectedTanggal] = useState<Date | null>(null);
  const [selectedKapasitas, setSelectedKapasitas] = useState('');
  const [selectedJamMulai, setSelectedJamMulai] = useState<Date | null>(null);
  const [selectedJamSelesai, setSelectedJamSelesai] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tanggal: selectedTanggal,
      kapasitas: parseInt(selectedKapasitas),
      jamMulai: selectedJamMulai,
      jamSelesai: selectedJamSelesai,
    });
  };

  const isFormValid =
    selectedTanggal &&
    selectedKapasitas &&
    selectedJamMulai &&
    selectedJamSelesai &&
    isAfter(selectedJamSelesai, selectedJamMulai);

  // Menentukan waktu minimum untuk jam selesai (30 menit setelah jam mulai)
  const minJamSelesai = selectedJamMulai
    ? setMinutes(setHours(selectedJamMulai, selectedJamMulai.getHours()), selectedJamMulai.getMinutes() + 5)
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr auto' },
          gap: 2,
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <DatePicker
          label="Tanggal"
          value={selectedTanggal}
          onChange={(newValue) => setSelectedTanggal(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
        <FormControl fullWidth>
          <InputLabel id="kapasitas-label">Kapasitas Minimal</InputLabel>
          <Select
            labelId="kapasitas-label"
            value={selectedKapasitas}
            label="Kapasitas Minimal"
            onChange={(e) => setSelectedKapasitas(e.target.value)}
          >
            <MenuItem value="">Pilih Kapasitas</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={16}>16</MenuItem>
            <MenuItem value={32}>32</MenuItem>
          </Select>
        </FormControl>
        <TimePicker
          label="Jam Mulai"
          ampm={false}
          value={selectedJamMulai}
          onChange={(newValue) => setSelectedJamMulai(newValue)}
          minutesStep={5}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
        <TimePicker
          label="Jam Selesai"
          ampm={false}
          value={selectedJamSelesai}
          onChange={(newValue) => setSelectedJamSelesai(newValue)}
          minutesStep={5}
          minTime={minJamSelesai}
          disabled={!selectedJamMulai}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<Search />}
          sx={{
            px: 4,
            py: 2,
            minWidth: { sm: 120, xs: '100%' },
          }}
          disabled={!isFormValid}
        >
          Cari
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

export default SearchBar;