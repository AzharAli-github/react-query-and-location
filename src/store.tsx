import {useContext, createContext, useReducer, useCallback, useMemo } from "react";
// import { CustomHook } from "./components/CustomHook";
import { useQuery } from "@tanstack/react-query";

interface Pokemon {
  id: number;
  name: string;
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}



function usePokemonSource(): {
  pokemon: Pokemon[];
  search: string;
  setSearch: (search: string) => void;
} {
    const { data: pokemon = [] } = useQuery<Pokemon[]>({
        queryKey: ["pokemon"],
        queryFn: () => fetch("/pokemon.json").then((res) => res.json()),
        initialData: [],
      });
  type PokemonState = {
    search: string;
  };
  type PokemonAction = {type: "setSearch"; payload: string};

  const[{search}, dispatch] = useReducer(
    (state: PokemonState, action: PokemonAction) => {
      switch (action.type) {
        case "setSearch":
          return {...state, search: action.payload}
      }
    },
    {
        search: "", 
      }
  );
  
    const setSearch = useCallback((search: string) => {
      dispatch({ 
        type: "setSearch", 
        payload: search });
    }, []);

    const filteredPokemon = useMemo(
        () =>
          (pokemon as Pokemon[])
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 20),
        [pokemon, search]
      );

     const sortedPokemon = useMemo(() => 
    [...filteredPokemon].sort((a, b) => a.name.localeCompare(b.name))
    , [filteredPokemon]
    )

  return { pokemon: sortedPokemon, search, setSearch };
}

const PokemonContext = createContext<
  ReturnType<typeof usePokemonSource>>(
    {} as unknown as ReturnType<typeof usePokemonSource>
  );    //({
//pokemon: [] as Pokemon[],
// })   can also use instead of undefined

export function usePokemon() {
  return useContext(PokemonContext);        //! can use this instead
}

export function PokemonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PokemonContext.Provider value={usePokemonSource()}>
      {children}
    </PokemonContext.Provider>
  )
}