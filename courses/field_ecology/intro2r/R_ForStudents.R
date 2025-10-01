# Load Libraries 
library(tidyverse)
library(readxl)

# Load data file into a new data frame
konzaData <- read_excel("~/Dropbox/Teaching/Field Ecology/2025 Fall/R Lab/Data/F25_KonzaVegetationPlotData.xlsx", sheet = "student tables")

# Two ways to check out the structure of the data frame
glimpse(konzaData)
str(konzaData)

# Calculate the mean and standard deviation
konzaSummary <- konzaData %>% 
  #we want to calculate mean and standard deviation between each group of Bison
  group_by(Bison) %>% 
  summarise(FQI_Avg = mean(FQI),
            FQI_sd = sd(FQI),
            count = n())

konzaPlot <- konzaData %>% 
  ggplot(aes(x = Bison, y = FQI, fill = Bison))+
  geom_boxplot(outliers = F)+
  geom_jitter()

konzaPlot  
