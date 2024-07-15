import React, { useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';

export const App: React.FC = () => {
  const debounceDelay = 300;
  const [focus, setFocus] = useState<boolean>(false);
  const [onSelected, setOnSelected] = useState<Person | null>(null);
  const [people, setPeople] = useState<Person[]>(peopleFromServer);
  const [searched, setSearched] = useState<string>('');

  const search = () => {
    const tmp = peopleFromServer.filter((person) => (
      person.name.toLocaleLowerCase().includes(searched.trim().toLocaleLowerCase())
    ))

    setPeople(tmp);
  };

  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    delay: number,
  ) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedSearch = debounce(search, debounceDelay);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;

    // Don't run filtering again if the text has not changed
    if (newText === searched) {
      return;
    }

    setSearched(newText);
    setOnSelected(null);

    // Show the list of all people when input is focused but empty
    if (!newText) {
      setPeople(peopleFromServer);
    }

    debouncedSearch();
  };

  const handleItemClick = (selectedPerson: Person) => {
    // Save selected suggestion text to the input on click
    setSearched(selectedPerson.name);

    // Hide suggestions on text change
    setFocus(false);

    // Pass selected person to the onSelected callback
    setOnSelected(selectedPerson);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {!onSelected ? 'No selected person' : `${onSelected.name} (${onSelected.born} - ${onSelected.died})`}
        </h1>

        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={searched}
              onChange={handleInput}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
            />
          </div>

          {focus && (
            <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
              <div className="dropdown-content">
                {people.length === 0 ? (
                  <div
                    className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
                    role="alert"
                    data-cy="no-suggestions-message"
                  >
                    <p className="has-text-danger">No matching suggestions</p>
                  </div>
                ) : (
                  people.map((person) => (
                    <div className="dropdown-item" data-cy="suggestion-item" key={person.name} onClick={() => handleItemClick(person)}>
                      <p className="has-text-link">{person.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );

};
