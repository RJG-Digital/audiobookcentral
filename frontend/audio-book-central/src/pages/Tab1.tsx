import { IonButton, IonCol, IonContent, IonHeader, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import { useState } from 'react';
import axios from 'axios';

import './Tab1.css';
import { Book } from '../models/book';
import BookCard from '../components/BookCard/bookCard';

const Tab1: React.FC = () => {
  // Search book
  const search = async () => {
    const payload = { searchType, searchText };
    const result = await axios.post('http://localhost:5500/api/books/search', payload);
    setBooks(result.data);
  }
  const searchTextChange = (event: any) => {
    setSearchText(event.target.value);
  }

  const onSearchTypeChange = (event: any) => {
    setSearchType(event.detail.value);
  }
  const [books, setBooks] = useState<Book[]>();
  const [searchText, setSearchText] = useState<string>();
  const [searchType, setSearchType] = useState<string>('title');
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
        <IonSelect value={searchType} onIonChange={(e) => onSearchTypeChange(e)} placeholder="Select fruit">
          <IonSelectOption value="title">Title</IonSelectOption>
          <IonSelectOption value="author">Author</IonSelectOption>
          <IonSelectOption value="isbn">ISBN</IonSelectOption>
        </IonSelect>
        <IonInput onIonChange={(e) => searchTextChange(e)}></IonInput>
        <IonButton onClick={search}>Search Book</IonButton>
        <IonRow className='row-wrapper'>
          {
            books?.map(book => {
              return (
                <IonCol key={book._id} className="book-col">
                  <BookCard bookData={book}></BookCard>
                </IonCol>
              )
            })
          }
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
