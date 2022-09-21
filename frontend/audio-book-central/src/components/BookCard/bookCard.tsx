import { IonCard, IonImg, IonLabel } from "@ionic/react";
import { Book } from '../../models/book';
import './bookCard.css';

const BookCard: React.FC<{ bookData: Book }> = (props) => {
    const { bookData } = props
    return (
        <IonCard className="card-wrapper">
            <IonImg className="image" src={bookData.image}></IonImg>
            <p>{bookData.author}</p>
           <p>{bookData.title}</p>
        </IonCard>
    )
}
export default BookCard;
