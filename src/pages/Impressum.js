import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Impressum = () => {
  const content = (
    <>
      <Typography variant="h6" gutterBottom>
        Angaben gemäß § 5 TMG:
      </Typography>
      <Typography variant="body1" paragraph>
        [Firmenname]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]<br />
        [Land]
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Kontakt:
      </Typography>
      <Typography variant="body1" paragraph>
        Telefon: [Telefonnummer]<br />
        E-Mail: [E-Mail-Adresse]
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Umsatzsteuer-ID:
      </Typography>
      <Typography variant="body1" paragraph>
        Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
        [Umsatzsteuer-ID]
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
      </Typography>
      <Typography variant="body1" paragraph>
        [Name]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]<br />
        [Land]
      </Typography>
    </>
  );

  return <LegalPage title="Impressum" content={content} />;
};

export default Impressum; 