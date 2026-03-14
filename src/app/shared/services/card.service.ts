import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card } from '../../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private cardsMap = new Map<string, BehaviorSubject<Card[]>>();

  private getSubject(columnId: string) {
    if (!this.cardsMap.has(columnId)) {
      this.cardsMap.set(columnId, new BehaviorSubject<Card[]>([]));
    }
    return this.cardsMap.get(columnId)!;
  }

  getCards(columnId: string) {
    return this.getSubject(columnId).asObservable();
  }

  // mutate niz, ne kreiraj novi
  setCards(columnId: string, cards: Card[]) {
    const subject = this.getSubject(columnId);
    subject.value.splice(0, subject.value.length, ...cards); // očisti i dodaj sve
    subject.next(subject.value);
  }

  addCard(columnId: string, card: Card) {
    const subject = this.getSubject(columnId);
    if (!subject.value.find((c) => c._id === card._id)) {
      subject.value.push(card);
      subject.next(subject.value);
    }
  }
}
