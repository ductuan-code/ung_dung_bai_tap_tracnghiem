import { useEffect, useState } from "react";
export default function useData(loader, key = "") {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: "", loader, key, version });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setState({
            data: null,
            loading: false,
            error: e.message,
            loader,
            key,
            version,
          });
      });
    return () => controller.abort();
  }, [loader, key, version]);
  const current =
    state.loader === loader && state.key === key && state.version === version;
  return {
    ...(current ? state : { data: null, loading: true, error: "" }),
    reload: () => setVersion((v) => v + 1),
  };
}
