import React from 'react';
import styles from '../styles/FloatingButton.module.css';
import { Button, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';


const FloatingButton = ({ onClick }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <div className={styles.button} onClick={onClick}>
        <Button onClick={toggleColorMode}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>   
    </div>
  );
};

export default FloatingButton;
