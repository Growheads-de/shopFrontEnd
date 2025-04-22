import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Datenschutz = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Verantwortlicher für die Datenverarbeitung
      </Typography>
      <Typography variant="body1" paragraph>
        [Firmenname]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]<br />
        [Land]<br />
        E-Mail: [E-Mail-Adresse]<br />
        Telefon: [Telefonnummer]
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Erhebung und Verarbeitung personenbezogener Daten
      </Typography>
      <Typography variant="body1" paragraph>
        Dies ist eine Beispiel-Datenschutzerklärung. Im Falle einer tatsächlichen Verwendung müsste dieser Text entsprechend den genauen Praktiken und rechtlichen Anforderungen aktualisiert werden.
      </Typography>
    </>
  );

  return <LegalPage title="Datenschutzerklärung" content={content} />;
};

export default Datenschutz; 