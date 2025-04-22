import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const AGB = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Willkommen bei unseren Allgemeinen Geschäftsbedingungen. Diese Bedingungen beschreiben die Regeln und Vorschriften für die Nutzung unserer Website.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        1. Geltungsbereich
      </Typography>
      <Typography variant="body1" paragraph>
        Die nachstehenden Allgemeinen Geschäftsbedingungen gelten für alle Rechtsgeschäfte zwischen uns und dem Kunden. Abweichende Allgemeine Geschäftsbedingungen des Kunden werden nicht anerkannt.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        2. Vertragsschluss
      </Typography>
      <Typography variant="body1" paragraph>
        Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern einen unverbindlichen Online-Katalog. Mit Anklicken des Buttons "Kaufen" geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        3. Preise und Zahlung
      </Typography>
      <Typography variant="body1" paragraph>
        Dies ist eine Beispiel-AGB. Im Falle einer tatsächlichen Verwendung müsste dieser Text entsprechend den genauen Geschäftspraktiken und rechtlichen Anforderungen aktualisiert werden.
      </Typography>
    </>
  );

  return <LegalPage title="Allgemeine Geschäftsbedingungen" content={content} />;
};

export default AGB; 