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

  setCards(columnId: string, cards: Card[]) {
    const subject = this.getSubject(columnId);
    subject.value.splice(0, subject.value.length, ...cards);
    subject.next([...cards]);
  }

  addCard(columnId: string, card: Card) {
    const subject = this.getSubject(columnId);
    if (!subject.value.find((c) => c._id === card._id)) {
      subject.next([...subject.value, card]);
    }
  }

  getCardsSnapshot(columnId: string): Card[] {
    return this.cardsMap.get(columnId)?.value ?? [];
  }

  deleteCard(columnId: string, cardId: string) {
    const subject = this.getSubject(columnId);

    const updated = subject.value
      .filter((c) => c._id !== cardId)
      .map((c, index) => ({
        ...c,
        order: index + 1,
      }));

    subject.next(updated);
  }
}
