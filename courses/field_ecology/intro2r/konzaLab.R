# Load Libraries 
library(tidyverse)
library(readxl)

# Load data file into a new data frame
konzaData <- read_excel("~/Dropbox/Classes/Field Ecology/Data/Assign fall 2024 Konza vegetation plot data.xlsx", sheet = "student tables")

# Two ways to check out the structure of the data frame
glimpse(konzaData)
str(konzaData)

# Calculate the mean and standard deviation
konzaSummary <- konzaData %>% 
  group_by(Bison) %>% 
  summarise(FQI_Avg = mean(FQI),
            FQI_sd = sd(FQI),
            count = n())

# Make a boxplot
fqiBisonPlot <- konzaData %>% #Data frame
  ggplot(aes(x = Bison, y = FQI, fill = Bison)) + #Y axis is Bison and Y axis is FQI, we want the box colors to be by bison group
  geom_boxplot(outliers = F) + #geom_ is the type of plot you want to make (geom_point, geom_line, etc)
  geom_jitter()+
  #Labs lets you set x, y, and plot title
  labs(title = "", 
       x = "Grazing Status", 
       y = "Floristic Quality Assessment") +
  #
  theme(legend.position = "none", #we dont really need a legend, remove it, can also set top and bottom
        axis.text.x = element_text(angle = 45, hjust = 1)) #rotate the x axis text to a 45 degree angle

fqiBisonPlot

# save plot
ggsave(filename = "fqiBisonPlot.png", plot = fqiBisonPlot, device = "png", 
       path =  "~/Dropbox/Classes/Field Ecology/", width = 297, height = 210, 
       units = "mm", limitsize = F, dpi = 700)
