import { IonCard, IonCol, IonRow } from "@ionic/react"
import { AudioBook } from '../models/book'

const AudioBookData: React.FC<{ bookData: AudioBook }> = (props) => {
    const { bookData } = props
    return (
        <IonRow>
            <IonCol>
                <IonCard>

                </IonCard>
            </IonCol>
        </IonRow>
    )
}
export default AudioBookData;