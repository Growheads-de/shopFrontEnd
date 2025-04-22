import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Widerrufsrecht = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Als Verbraucher haben Sie das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Widerrufsfrist
      </Typography>
      <Typography variant="body1" paragraph>
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Ausübung des Widerrufsrechts
      </Typography>
      <Typography variant="body1" paragraph>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2 }} paragraph>
        [Firmenname]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]<br />
        [Land]<br />
        E-Mail: [E-Mail-Adresse]<br />
        Telefon: [Telefonnummer]
      </Typography>
      
      <Typography variant="body1" paragraph>
        mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Folgen des Widerrufs
      </Typography>
      <Typography variant="body1" paragraph>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
      </Typography>
    </>
  );

  return <LegalPage title="Widerrufsrecht" content={content} />;
};

export default Widerrufsrecht; 