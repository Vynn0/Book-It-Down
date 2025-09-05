import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
} from '@mui/material';
import { Search} from '@mui/icons-material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { setMinutes, setHours, isAfter} from 'date-fns';

// Backendnya...
interface SearchBarProps {
  onSearch: (query: {
    tanggal: Date | null;
    jamMulai: Date | null;
    jamSelesai: Date | null;
    kapasitas: number;
  }) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [selectedTanggal, setSelectedTanggal] = useState<Date | null>(null);
  const [selectedJamMulai, setSelectedJamMulai] = useState<Date | null>(null);
  const [selectedJamSelesai, setSelectedJamSelesai] = useState<Date | null>(null);
  const [selectedKapasitas, setSelectedKapasitas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tanggal: selectedTanggal,
      jamMulai: selectedJamMulai,
      jamSelesai: selectedJamSelesai,
      kapasitas: parseInt(selectedKapasitas),
    });
  };

  const isFormValid =
    selectedTanggal &&
    selectedJamMulai &&
    selectedJamSelesai &&
    selectedKapasitas &&
    isAfter(selectedJamSelesai, selectedJamMulai);

  // Menentukan waktu minimum untuk jam selesai (30 menit setelah jam mulai)
  const minJamSelesai = selectedJamMulai
    ? setMinutes(setHours(selectedJamMulai, selectedJamMulai.getHours()), selectedJamMulai.getMinutes() + 5)
    : null;

    // Di bawah in Front Endnya...
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
          slotProps={{ textField: { fullWidth: true } }}
        />
        <TimePicker
          label="Jam Mulai"
          ampm={false}
          value={selectedJamMulai}
          onChange={(newValue) => setSelectedJamMulai(newValue)}
          minutesStep={5}
          slotProps={{ textField: { fullWidth: true } }}
        />
        <TimePicker
          label="Jam Selesai"
          ampm={false}
          value={selectedJamSelesai}
          onChange={(newValue) => setSelectedJamSelesai(newValue)}
          minutesStep={5}
          minTime={minJamSelesai || undefined}
          disabled={!selectedJamMulai}
          slotProps={{ textField: { fullWidth: true } }}
        />
          <TextField
          label="Kapasitas"
          type="number"
          value={selectedKapasitas}
          onChange={(e) => setSelectedKapasitas(e.target.value)}
          disabled={!selectedJamSelesai}
          fullWidth
          InputProps={{
            inputProps: { min: 1 } 
          }}
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