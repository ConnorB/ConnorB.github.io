# Software

I develop and maintain open-source R packages for working with aquatic and stream-ecology data. All are released under the AGPL (\>= 3) license — contributions and bug reports are welcome on GitHub.

`preMetabolizer`

*A utility package for streamMetabolizer • Author & maintainer*

Tools for preparing environmental time series before fitting stream metabolism models. The package includes helpers for downloading meteorological and elevation data, aligning irregular observations, converting units, and calculating light, pressure, dissolved gas, and water property inputs for streamMetabolizer.

``` mb-2
pak::pak("ConnorB/preMetabolizer")
```

[Docs](https://connorb.github.io/preMetabolizer/)[R-universe](https://connorb.r-universe.dev/preMetabolizer)[GitHub](https://github.com/ConnorB/preMetabolizer)

`flowcam`

*Download and animate USGS stream-gage camera images • Author & maintainer*

A tidy interface to the USGS National Imagery Management System (NIMS) API: discover stream-gage cameras across the US, list and download their images, and assemble them into animated GIFs or MP4 videos.

``` mb-2
pak::pak("ConnorB/flowcam")
```

[Docs](https://connorb.github.io/flowcam/)[R-universe](https://connorb.r-universe.dev/flowcam)[GitHub](https://github.com/ConnorB/flowcam)

`streamDAG`

*Analytical methods for stream DAGs • Contributor*

Indices and tools for analyzing directed acyclic graphs (DAGs), particularly DAG representations of intermittent (non-perennial) stream networks. Introduced in Aho et al. (2023), Non-perennial stream networks as directed acyclic graphs: The R-package streamDAG. *Environmental Modelling & Software.* doi:10.1016/j.envsoft.2023.105775

``` mb-2
pak::pak("moondog1969/streamDAG")
```

[R-universe](https://moondog1969.r-universe.dev/streamDAG)[GitHub](https://github.com/moondog1969/streamDAG)[DOI](https://doi.org/10.1016/j.envsoft.2023.105775)
