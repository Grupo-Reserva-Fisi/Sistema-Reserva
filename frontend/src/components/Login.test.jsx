import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from './Login';

describe('Pruebas Unitarias e Interfaz - HU-U01 Login', () => {
  it('CP-01: Muestra advertencia si el código/DNI no cumple con el formato (mínimo 6 caracteres)', () => {
    render(<Login />);
    
    const inputCodigo = screen.getByLabelText(/Código Universitario o DNI/i);
    const boton = screen.getByRole('button', { name: /Ingresar al Sistema/i });

    // Ingresar menos de 6 caracteres
    fireEvent.change(inputCodigo, { target: { value: '123' } });
    fireEvent.click(boton);

    expect(screen.getByText(/El Código universitario o DNI debe tener entre 6 y 20 caracteres/i)).toBeInTheDocument();
  });

  it('CP-02: Muestra advertencia si la contraseña está vacía', () => {
    render(<Login />);

    const inputCodigo = screen.getByLabelText(/Código Universitario o DNI/i);
    const boton = screen.getByRole('button', { name: /Ingresar al Sistema/i });

    fireEvent.change(inputCodigo, { target: { value: '20200123' } });
    fireEvent.click(boton);

    expect(screen.getByText(/Por favor, ingresa tu contraseña/i)).toBeInTheDocument();
  });

  it('CP-03: Deshabilita el botón y cambia texto al enviar (estado de carga)', async () => {
    render(<Login />);

    const inputCodigo = screen.getByLabelText(/Código Universitario o DNI/i);
    const inputPass = screen.getByLabelText(/Contraseña/i);
    const boton = screen.getByRole('button', { name: /Ingresar al Sistema/i });

    fireEvent.change(inputCodigo, { target: { value: '20200123' } });
    fireEvent.change(inputPass, { target: { value: 'password123' } });
    fireEvent.click(boton);

    // Debe mostrar feedback de validación
    expect(screen.getByText(/Validando/i)).toBeInTheDocument();
    expect(boton).toBeDisabled();
  });
});