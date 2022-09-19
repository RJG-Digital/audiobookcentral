import { IonButton, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useRef, useState } from 'react';
import axios from 'axios';

import './Tab1.css';

const Tab1: React.FC = () => {
  // Search book
  const search = async () => {
    const searchText = searchRef.current?.value?.toString().trim();
    const result = await axios.get(`http://localhost:5000/api/audiobooks/${searchText}`);
    console.log(result.data);
  }

  const searchRef = useRef<HTMLIonInputElement>(null);
  const [searchText, setSearchText] = useState<string>();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonInput ref={searchRef}></IonInput>
        <IonButton onClick={search}>Search Book</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
